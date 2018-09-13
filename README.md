# Notadd 用户模块(Grpc 版本)

Notadd 用户服务，向 Notadd 主程序提供 rpc 接口，其功能与 [**graphql-api**](https://github.com/notadd/ns-module-user/tree/graphql-api) 版基本一致

## 使用说明

1. 下载 `master` 分支到本地
2. 安装依赖 `yarn install`
3. 修改数据库配置，配置项在 `user.module.ts` 中，只需修改 `host`、`port`、`username`、`password`、`database`、
4. 启动 server，`yarn start`
5. 启动 Notadd 主程序，[Notadd](https://github.com/notadd/notadd)