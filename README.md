# Notadd 用户模块

## 文档

- [设计文档](./doc/design.md)

## 功能

- [x] 注册
- [x] 登录授权
- [x] 鉴权
- [x] 组织管理
- [x] 用户管理
- [x] 角色管理
- [x] 信息组管理
- [x] 信息项管理
- [ ] ......

## 使用说明

用户模块的大部分接口都定义了权限，在初始化时，会生成一个超级管理员用户，账号为： `sadmin`，密码为： `sadmin`，可以自行登录后，使用 `accessToken` 调用 `updateCurrentUserInfo` (更新当前登录用户信息)，修改密码。

### 导入用户模块

在应用程序根模块中导入 `UserModule`

### 资源定义

`@Resouce`，是用户对某一实体资源进行业务操作的统称。

在 `Resolver` 或 `Controller` 类上设置定义资源的注解，用于定义当前资源，如：

`@Resource({ name: '文章管理', identify: 'artical:manage' })`

`name`: 资源的名称，用于定义权限的父级名称，命名方式为: `资源+行为`，如：`应用内文章管理的相关api => '文章管理'`

`identity`: 资源的唯一标识，命名方式为 `模块名:类名` 或 `name` 的拆分英文，如： `'文章管理' => 'artical:manage'`

### 权限定义

`@Permission`，是用户对当前实体资源进行某一具体操作的定义。

在 `Resolver`、`Controller` 方法上设置定义操作的注解，用户定义对当前资源的操作权限，如：

`@Permission({ name: '添加文章', identify: 'artical:create', action: 'create', personal: true })`

`name`: 权限的名称，用于定义具体的权限名称，命名方式为：`操作+资源`，如：`在文章资源中添加文章 => '添加文章'`

`identify`: 权限的唯一标识，命名方式为：`资源:方法`，如：`'添加文章' => 'artical:createArtical'`

`action`: 权限操作类型，只能是 `create、delete、update、find` 中的一个

权限的定义离不开资源的定义，二者是共存的状态，在使用权限功能时，先在类上定义资源，而后在需要权限控制的方法上定义权限。

定义好资源和权限后，启动程序，资源和权限会被自动加载并存储到数据库。

### 配置授权，鉴权功能

以下是 `apollo-server-express` 2.x 版本的授权、鉴权功能逻辑示例

> app.module.ts

```typescript
import { Inject, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLFactory, GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServer } from 'apollo-server-express';
import * as GraphQLJSON from 'graphql-type-json';

import { AuthenticationGurad, AuthService, UserModule } from '@notadd/module-user';

@Module({
    imports: [
        GraphQLModule,
        TypeOrmModule.forRoot(),
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
        const typeDefs = this.graphQLFactory.mergeTypesByPaths('**/*.types.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs, resolvers: { JSON: GraphQLJSON } });

        const server = new ApolloServer({
            schema,
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
        });
        server.applyMiddleware({ app });
    }
}
```

## 接口逻辑说明

用户模块向各类上层业务系统提供了丰富且灵活的接口，以下介绍常用的接口逻辑

### 资源

**Query**：

- `findResources` 查询所有资源权限，返回当前业务系统定义的所有资源和权限数据

### 角色

**Query**：

- `findRoles` 查询所有角色，返回所有角色的 id 和 name
- `findOneRoleInfo(roleId: Int!)` 查询角色信息，返回指定 id 的角色详细信息，包含角色拥有的权限及其拥有的信息项

**Mutation**：

- `createRole(name: String!)` 添加角色
- `updateRole(id: Int!, name: String!)` 更新角色名称
- `deleteRole(id: Int!)` 删除指定 id 的角色
- `setPermissionsToRole(roleId: Int!, permissionIds: [Int]!)` 给角色设置权限

### 信息组

**Query**：

- `findAllInfoGroup` 查询所有信息组
- `findInfoItemsByGroupId(groupId: Int!)` 查询指定信息组下的所有信息项

**Mutation**：

- `createInfoGroup(name: String!, roleId: Int!)` 新增信息组
- `deleteInfoGroup(groupId: Int!)` 删除指定ID的信息组
- `updateInfoGroup(groupId: Int!, name: String, roleId: Int)` 更新指定ID的信息组名称或所属角色
- `addInfoItemToInfoGroup(infoGroupId: Int!, infoItemIds: [Int]!)` 向指定信息组添加指定信息项
- `deleteIntoItemFromInfoGroup(infoGroupId: Int!, infoItemIds: [Int]!)` 删除指定信息组的指定信息项

### 信息项

**Query**：

- `findAllInfoItem` 查询所有信息项

**Mutation**：

- `createInfoItem(infoItemInput: InfoItemInput)` 新增信息项
- `deleteInfoItem(infoItemId: Int!)` 删除指定ID的信息项
- `updateInfoItem(updateInfoItemInput: UpdateInfoItemInput)` 更新指定ID的信息项名称、标签、描述、类型

### 组织

**Query**：

- `findRootOrganizations` 获取根组织
- `findAllOrganizations` 获取所有组织
- `findChildrenOrganizations(id: Int!)` 获取指定组织下的所有子组织

**Mutation**：

- `createOrganization(name: String!, parentId: Int)` 创建组织，parentId 为空时，代表创建根组织
- `updateOrganization(id: Int!, name: String!, parentId: Int!)` 更新组织
- `deleteOrganization(id: Int!)` 删除组织
- `addUsersToOrganization(id: Int!, userIds: [Int]!)` 给组织添加用户
- `deleteUserFromOrganization(id: Int!, userIds: [Int]!)` 删除组织下的用户

### 用户

**Query**：

- `login(username: String!, password: String!)` 普通用户登录
- `findRegisterUserInfoItem` 查询普通用户注册时所需填写的信息项
- `findCurrentUserInfo` 查询当前登录的用户信息
- `findUserInfoById(userId: Int!)` 通过ID查询用户信息
- `findUsersInRole(roleId: Int!)` 查询指定角色ID下的所有用户信息
- `findUsersInOrganization(organizationId: Int!)` 获取指定组织ID下的用户

**Mutation**：

- `register(registerUserInput: RegisterUserInput)` 普通用户注册，参数 infoKVs 中的 key 是信息项的ID(infoItem.id)，值是信息项的值(userInfo.value)
- `createUser(createUserInput: CreateUserInput)` 创建用户，参数 infoKVs 中的 key 是信息项的ID(infoItem.id)，值是信息项的值(userInfo.value)
- `addUserRole(userId: Int!, roleId: Int!)` 给用户添加角色
- `deleteUserRole(userId: Int!, roleId: Int!)` 删除用户角色
- `recycleUser(userId: Int!)` 删除用户到回收站
- `deleteRecycledUser(userId: Int!)` 删除回收站内的用户
- `updateUserInfo(userId: Int!, updateUserInput: UpdateUserInput)` 更新用户信息，参数 infoKVs 中的 key是用户信息项值的ID(userInfo.id)，value是信息项的值(userInfo.value)，relationId 是信息项的ID，当返回的 key 为 null 时，也需要传入 null
- `updateCurrentUserInfo(updateCurrentUserInput: UpdateCurrentUserInput)` 更新当前登录用户信息，参数 infoKVs 中的 key是用户信息项值的ID(userInfo.id)，value是信息项的值(userInfo.value)，relationId 是信息项的ID，当返回的 key 为 null 时，也需要传入 null