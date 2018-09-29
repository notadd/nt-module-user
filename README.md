# Notadd 用户模块(Grpc 版本)

Notadd 用户服务，向 Notadd 主程序提供 rpc 接口，其功能与 [**graphql-api**](https://github.com/notadd/nt-module-user/tree/graphql-api) 版基本一致

接口文档和权限设计文档在 [graphql-api 分支下](https://github.com/notadd/nt-module-user/blob/graphql-api/README_zh.md)

## 使用说明

1. 克隆 `master` 分支到本地
2. 安装依赖 `yarn install`
3. 手动创建数据库
4. 修改数据库配置，配置项在 `user.module.ts` 中，只需修改 `host`、`port`、`username`、`password`、`database`  (database 必须为创建好的数据库)
5. 启动 server，`yarn start`
6. 启动 Notadd 主程序，[Notadd](https://github.com/notadd/notadd)
