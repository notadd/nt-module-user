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

用户模块的大部分接口都定义了权限，在初始化时，会生成一个超级管理员用户，账号为： `sadmin`，密码为： `sadmin`，可以自行登录后，使用 `accessToken` 调用 `updateCurrentUserInfo` (更新当前登录用户信息)，修改密码

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

定义好资源和权限后，启动程序，资源和权限会被自动加载并存储到数据库

### 配置授权，鉴权功能

以下是 `apollo-server-express` 2.x 版本的授权、鉴权功能逻辑示例

> app.module.ts

```typescript
import { Inject, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLFactory, GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServer } from 'apollo-server-express';

import { AuthenticationGurad, AuthService, UserModule } from '@notadd/module-user';

@Module({
    imports: [
        GraphQLModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'module_user',
            entities: ['./**/*.entity.ts'],
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
        const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.types.graphql');
        const schema = this.graphQLFactory.createSchema({ typeDefs });

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