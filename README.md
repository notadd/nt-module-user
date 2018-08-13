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

### 资源定义

`@Resouce`，是用户对某一实体资源进行业务操作的统称。

在 `Controller` 或 `Resolver` 类上进行注解定义：`@Resource({ name: xxx, identify: xxx })`

### 权限定义

`@Permission`，是用户对当前实体资源进行某一具体操作的定义。

在类实例方法上进行注解定义：`@Permission({ name: xxx, identify: xxx, action: xxx })`
