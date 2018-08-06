import { FastifyAdapter, NestFactory } from '@nestjs/core';
import { GraphQLFactory } from '@nestjs/graphql';
import * as bodyParser from 'body-parser';
import { fastifyGraphiQL, fastifyGraphQL } from 'fastify-graphql-middleware';

import { authentication } from './middlewares/authentication.middleware';
import { UserModule } from './user.module';

async function bootstrap() {
    const app = await NestFactory.create(UserModule, new FastifyAdapter());

    // graphql IDE
    app.use('/graphiql', fastifyGraphiQL({ endpointURL: '/graphql' }));

    // body-parser
    app.use('/graphql', bodyParser.json());

    // 授权中间件
    app.use('/graphql', authentication);

    /* graphql 配置 */
    const graphQLFactory = app.get(GraphQLFactory);
    const typeDefs = graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = graphQLFactory.createSchema({ typeDefs });
    app.use('/graphql', fastifyGraphQL(req => ({ schema, rootValue: req })));

    await app.listen(3000);
}

bootstrap();