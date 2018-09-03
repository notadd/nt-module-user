import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLConfigService } from 'src/services/graphql-config.service';

import { AuthorizationGurad, UserModule } from '../src';

@Module({
    imports: [
        GraphQLModule.forRootAsync({
           useClass: GraphQLConfigService
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'module_user',
            entities: [__dirname + '/../src/**/*.entity.ts'],
            logger: 'simple-console',
            logging: false,
            synchronize: true,
            dropSchema: false
        }),
        UserModule
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthorizationGurad },
    ],
    exports: []
})
export class AppModule { }