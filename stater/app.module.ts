import { Inject, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLFactory, GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import * as jwt from 'jsonwebtoken';

import { AuthService } from '../src/authentication/authentication.service';
import { AuthenticationGurad } from '../src/gurads/authentication.gurad';
import { UserModule } from '../src/user.module';

@Module({
    imports: [
        GraphQLModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'postgres',
            entities: [__dirname + '/../src/**/*.entity.ts'],
            logger: 'simple-console',
            logging: true,
            synchronize: true,
            dropSchema: false
        }),
        UserModule
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthenticationGurad },
    ],
    exports: []
})
export class AppModule {
    constructor(
        @Inject(GraphQLFactory) private readonly graphQLFactory: GraphQLFactory,
        @Inject(AuthService) private readonly authService: AuthService
    ) { }

    configureGraphQL(app: any) {
        const typeDefs = this.graphQLFactory.mergeTypesByPaths(__dirname + '/../src/**/*.types.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs });

        const server = new ApolloServer({
            schema,
            context: async ({ req }) => {
                if (req.body && ['IntrospectionQuery', 'login', 'register'].includes(req.body.operationName)) {
                    return;
                }
                const token = (req.headers.authorization as string).split('Bearer ')[1];
                try {
                    const decodedToken = <{ username: string }>jwt.verify(token, 'secretKey');
                    const user = await this.authService.validateUser({ username: decodedToken.username });
                    return { user };
                } catch (error) {
                    if (error instanceof jwt.JsonWebTokenError) {
                        throw new AuthenticationError('授权失败，请检查 token 是否正确');
                    }
                    if (error instanceof jwt.TokenExpiredError) {
                        throw new AuthenticationError('授权失败，token 已经过期');
                    }
                }
            },
            formatResponse: res => {
                if (res.errors && res.errors[0].message.statusCode === 403) {
                    return { code: 403, message: '调用接口失败，没有权限' };
                }
                return res;
            },
            playground: {
                settings: {
                    'editor.theme': 'light',
                    'editor.cursorShape': 'line'
                },
            },
        });
        server.applyMiddleware({ app });
    }
}