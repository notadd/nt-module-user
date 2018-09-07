# Notadd User Module

[中文文档](./README_zh.md)

## Document

- [Design Document](./doc/design.md)

## Features

- [x] registration
- [x] login authorization
- [x] Authentication
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

`@Resouce` is a general term for users to perform business operations on an entity resource.

Set annotations for defining resources on the `Resolver` or `Controller` class to define the current resource, such as:

`@Resource({ name: 'article management', identify: 'artical:manage' })`

`name`: The name of the resource, which is used to define the parent name of the permission. The naming method is: `resource+behavior`, such as: `related article management related api => 'article management'

`identity`: The unique identifier of the resource, such as: `'article management' => 'artical:manage'`

### Permission Definition

`@Permission` is a definition of a specific operation performed by the user on the current entity resource.

Set annotations for defining operations on the `Resolver` and `Controller` methods. The user defines the operation permissions on the current resource, such as:

`@Permission({ name: 'Add article', identify: 'artical:create', action: 'create', personal: true })`

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

#### Authentication function, using the `validateUser` method of the `AuthenticationService` class in the graphql context, and passing the authenticated user to the context

`GraphQLJSON` is used to handle the `JSON` scalar type in graphql, you need to install `graphql-type-json` additionally, and then configure it into the resolvers option.

> graphql-config.service.ts

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { AuthenticationService } from '@notadd/module-user';

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
            }
        };
    }
}
```

## API Logic Description

User modules provide rich and flexible interfaces to various upper-layer business systems. The following describes common interface logic.

### Resources

**Query**:

- `findResources` queries all resource permissions and returns all resource and permission data defined by the current business system

### Roles

**Query**:

- `findRoles` queries all roles, returns the id and name of all roles
- `findOneRoleInfo(roleId: Int!)` Query role information, return the role details of the specified id, including the permissions owned by the role and the information items they own

**Mutation**:

- `createRole(name: String!)` Add a role
- `updateRole(id: Int!, name: String!)` Update the role name
- `deleteRole(id: Int!)` deletes the role of the specified id
- `setPermissionsToRole(roleId: Int!, permissionIds: [Int]!)` Set permissions for the role

### Information Groups

**Query**:

- `findAllInfoGroup` Query all information groups
- `findInfoItemsByGroupId(groupId: Int!)` Query all information items under the specified information group

**Mutation**:

- `createInfoGroup(name: String!, roleId: Int!)` New information group
- `deleteInfoGroup(groupId: Int!)` Delete the information group of the specified ID
- `updateInfoGroup(groupId: Int!, name: String, roleId: Int)` Update the group name or the assigned role of the specified ID
- `addInfoItemToInfoGroup(infoGroupId: Int!, infoItemIds: [Int]!)` Adds the specified information item to the specified information group
- `deleteIntoItemFromInfoGroup(infoGroupId: Int!, infoItemIds: [Int]!)` Delete the specified information item of the specified information group

### Information Items

**Query**:

- `findAllInfoItem` Query all information items

**Mutation**:

- `createInfoItem(infoItemInput: InfoItemInput)` new information item
- `deleteInfoItem(infoItemId: Int!)` Delete the information item of the specified ID
- `updateInfoItem(updateInfoItemInput: UpdateInfoItemInput)` Updates the information item name, label, description, and type of the specified ID

### Organizations

**Query**:

- `findRootOrganizations` Get the root organization
- `findAllOrganizations` Get all organizations
- `findChildrenOrganizations(id: Int!)` Get all suborganizations under the specified organization

**Mutation**:

- `createOrganization(name: String!, parentId: Int)` creates an organization, when the parentId is empty, it represents the creation of the root organization
- `updateOrganization(id: Int!, name: String!, parentId: Int!)` Update organization
- `deleteOrganization(id: Int!)` delete organization
- `addUsersToOrganization(id: Int!, userIds: [Int]!)` Add users to the organization
- `deleteUserFromOrganization(id: Int!, userIds: [Int]!)` Delete the user under the organization

### Users

**Query**:

- `login(username: String!, password: String!)` Ordinary user login
- `findRegisterUserInfoItem` Query the information items required for normal user registration
- `findCurrentUserInfo` Query the currently logged in user information
- `findUserInfoById(userId: Int!)` Query user information by ID
- `findUsersInRole(roleId: Int!)` Query all user information under the specified role ID
- `findUsersInOrganization(organizationId: Int!)` Get the user under the specified organization ID

**Mutation**:

- `register(registerUserInput: RegisterUserInput)` Normal user registration, the key in the parameter infoKVs is the ID of the information item (infoItem.id), and the value is the value of the information item (userInfo.value)
- `createUser(createUserInput: CreateUserInput)` creates the user, the key in the parameter infoKVs is the ID of the information item (infoItem.id), and the value is the value of the information item (userInfo.value)
- `addUserRole(userId: Int!, roleId: Int!)` Add a role to the user
- `deleteUserRole(userId: Int!, roleId: Int!)` Delete user role
- `recycleUser(userId: Int!)` delete user to recycle bin
- `deleteRecycledUser(userId: Int!)` deletes users in the recycle bin
- `updateUserInfo(userId: Int!, updateUserInput: UpdateUserInput)` Update user information, the key in the parameter infoKVs is the ID of the user information item value (userInfo.id), the value is the value of the information item (userInfo.value), and the relationId is The ID of the information item. When the returned key is null, you also need to pass in null.
- `updateCurrentUserInfo(updateCurrentUserInput: UpdateCurrentUserInput)` Updates the current login user information. The key in the infocVs parameter is the ID of the user information item value (userInfo.id), the value is the value of the information item (userInfo.value), and the relationId is the information item. ID, when the returned key is null, you also need to pass in null