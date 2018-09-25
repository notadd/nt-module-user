# Notadd User Module(GraphQL Api Version)

[中文文档](./README_zh.md)

## Document

- [Design Document](./doc/design.md)

## Features

- [x] registration
- [x] login
- [x] Authorization and Authentication
- [x] Organization Management
- [x] User Management
- [x] role management
- [x] Information Group Management
- [x] Information Item Management
- [x] Global i18n support
- [ ] ......

## Instructions for use

Most of the interfaces of the user module define permissions. When initializing, a super administrator user will be generated. The account number is: `sadmin`, and the password is: `sadmin`. After logging in, use `accessToken` to call `updateCurrentUserInfo`. (Update the current login user information) and change the password.

### Import User Module

Import `UserModule` in the application root module, and configure the i18n option

### Resource Definition

`@Resource` is a general term for users to perform business operations on an entity resource.

Set annotations for defining resources on the `Resolver` or `Controller` class to define the current resource, such as:

`@Resource({ name: 'article management', identify: 'artical:manage' })`

`name`: The name of the resource, which is used to define the parent name of the permission. The naming method is: `resource+behavior`, such as: `related article management related api => 'article management'

`identity`: The unique identifier of the resource, such as: `'article management' => 'artical:manage'`

### Permission Definition

`@Permission` is a definition of a specific operation performed by the user on the current entity resource.

Set annotations for defining operations on the `Resolver` and `Controller` methods. The user defines the operation permissions on the current resource, such as:

`@Permission({ name: 'Add article', identify: 'artical:create', action: 'create' })`

`name`: The name of the permission, used to define the specific permission name, named: `operation + resource`, such as: `Add article in the article resource => 'Add article'

`identify`: The unique identifier of the permission, named: `resource: method`, such as: `'Add article' => 'artical:createArtical'`

`action`: permission operation type, can only be one of `create, delete, update, find`

The definition of permissions is inseparable from the definition of resources. The two are coexisting states. When using the permission function, the resources are defined on the class first, and then the permissions are defined on the methods that require permission control.

Once the resources and permissions are defined, the launcher, resources, and permissions are automatically loaded and stored in the database.

### Configure authorization, authentication function

The following is an example of the authorization and authentication function logic for the `apollo-server-express` 2.x version.

#### Authorization function can be automatically configured by simply importing `UserModule`

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '@notadd/module-user';

@Module({
    imports: [
        GraphQLModule.forRootAsync({
           useClass: GraphQLConfigService
        }),
        TypeOrmModule.forRoot(),
        UserModule.forRoot({ i18n: 'en-US' })
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule { }
```

#### Authentication function, using the `validateUser` method of the `AuthService` class in the graphql context, and passing the authenticated user to the context

`GraphQLJSON` is used to handle the `JSON` scalar type in graphql, you need to install `graphql-type-json` additionally, and then configure it into the resolvers option.

> graphql-config.service.ts

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { AuthService } from '@notadd/module-user';

@Injectable()
export class GraphQLConfigService implements GqlOptionsFactory {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) {}

    createGqlOptions(): GqlModuleOptions {
        return {
            typePaths: ['./**/*.types.graphql'],
            resolvers: { JSON: GraphQLJSON },
            context: async ({ req }) => {
                const user = await this.authService.validateUser(req);
                return { user };
            }
        };
    }
}
```