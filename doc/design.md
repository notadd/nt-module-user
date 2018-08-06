# 用户模块设计文档

用户模块现阶段只提供最基础的基于RBAC的权限控制方案，其中表结构尽可能的抽象化，不提供详细的字段，如用户信息等字段，由上层的业务系统进行扩展。

用户角色、权限的默认数据由上层业务系统进行配置，用户模块需提供接口用于数据的初始化。

## 功能

- [ ] 注册
- [ ] 登录授权
- [ ] 鉴权
- [ ] ......

### 实现逻辑概述

登录授权时，可将计算好的权限值加密到 access_token 中，在调用接口时，通过对 access_token 的解密，获取权限值，将权限值与请求方法进行比对，从而达到鉴权的效果。

鉴权时，使用中间件将 access_token 中的权限赋值到 request 对象中，在方法调用前，使用守卫对权限和方法上的注解进行比对，一致时允许调用，否则返回403。

在调用安全系数较高的方法时，可使用二次验证的机制确保请求中的 access_token 权限值不被篡改，二次验证机制可在权限下级的功能操作表中设置是否开启二次验证字段。

### 授权流程

通过用户名和密码登录，授权服务会验证，验证成功后返回 JWT 签名后的 access_token、refresh_token、expires_in

`access_token`：令牌，计算方法：jwt.sign(username, sha256(permission[]))

`refresh_token`：刷新令牌，当 access_token 失效时，用 refresh_token 进行刷新，计算方法：sha256(username+new Date())

`expires_in`：令牌失效时间，当前时间+2小时

```none
+-----------+                                     +-------------+
|           |       1-Request Authorization       |             |
|           |------------------------------------>|             |
|           |          username&password          |             |--+
|           |                                     |Authorization|  | 2-Gen
|  Client   |                                     |   Service   |  |   JWT
|           |       3-Response Authorization      |             |<-+
|           |<------------------------------------| Private Key |
|           |    access_token / refresh_token     |             |
|           |             expires_in               |             |
+-----------+                                     +-------------+
```

### 鉴权流程

请求时，在请求头设置 Authorization: bearer Access Token，资源服务对 Access Token 进行验证（解密），成功后，将 access_token 中 permission[] 数组里的权限值和所请求方法上的 @Permission() 注解中的权限值进行比对，如果存在，则代表本次请求的用户拥有对当前资源操作的权限，否则拒绝请求

```none
+-----------+                                    +------------+
|           |       1-Request Resource           |            |
|           |----------------------------------->|            |
|           | Authorization: bearer Access Token |            |--+
|           |                                    |  Resource  |  | 2-Verify
|  Client   |                                    |  Service   |  |   Token
|           |       3-Response Resource          |            |<-+
|           |<-----------------------------------| Public Key |
|           |                                    |            |
+-----------+                                    +------------+
```

#### 资源注解

在 `Resolver`、`Controller` 类上设置定义资源的注解，用于定义当前资源，如：

`@Resource({ name: '文章管理', identify: 'artical:manage' })`

`name`: 资源的名称，用于定义权限的父级名称，命名方式为: `资源+行为`，如：`应用内文章管理的相关api => '文章管理'`

`identity`: 资源的唯一标识，命名方式为 `模块名:类名` 或 name 的拆分英文，如： `'文章管理' => 'artical:manage'`

#### 权限注解

在 `Resolver`、`Controller` 方法上设置定义操作的注解，用户定义对当前资源的操作权限，如：

`@Permission({ name: '添加文章', identify: 'artical:create', action: 'create', personal: true })`

`name`: 权限的名称，用于定义具体的权限名称，命名方式为：`操作+资源`，如：`在文章资源中添加文章 => '添加文章'`

`identify`: 权限的唯一标识，命名方式为：`资源:方法`，如：`'添加文章' => 'artical:createArtical'`

`action`: 权限操作类型，只能是 `create、delete、update、find` 中的一个

`personal`: 权限是否属于私人，如果属于，则在执行这个操作时，需要判断当前请求对象中的用户ID是否是当前资源的拥有者

注意： **资源的唯一标识和权限的唯一标识组成一个全局唯一的方法**

#### 注解加载机制

程序加载模块时，将把类和方法上的注解值保存到数据库，超级管理员登录后台后，即可创建用户，角色，然后给角色分配权限或具体的操作，最终把角色分配给用户

用户在注册时，管理员可以定义默认的角色及其所拥有的权限

##### 参考文献

https://cnodejs.org/topic/551802d3687c387d2f5b2906

https://cnodejs.org/topic/5604dd63272b724e5efefc96