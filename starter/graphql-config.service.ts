import { Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import * as GraphQLJSON from 'graphql-type-json';

@Injectable()
export class GraphQLConfigService implements GqlOptionsFactory {
    createGqlOptions(): GqlModuleOptions {
        return {
            typePaths: ['src/**/*.types.graphql', 'node_modules/**/*.types.graphql'],
            resolvers: { JSON: GraphQLJSON },
            context: ({ req }) => ({ req })
        };
    }
}