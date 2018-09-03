import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import * as GraphQLJSON from 'graphql-type-json';

import { AuthenticationService } from '../auth/authtication.service';

@Injectable()
export class GraphQLConfigService implements GqlOptionsFactory {
    constructor(
        @Inject(AuthenticationService) private readonly authService: AuthenticationService
    ) {}

    createGqlOptions(): GqlModuleOptions {
        return {
            typePaths: ['./**/*.types.graphql'],
            resolvers: { JSON: GraphQLJSON },
            context: async ({ req }) => {
                const user = await this.authService.validateUser(req);
                return { user };
            },
            playground: {
                settings: {
                    'editor.theme': 'light',
                    'editor.cursorShape': 'line'
                }
            }
        };
    }
}