# 用户模块设计文档

## 实现逻辑概述

登录授权时，可将用户名、用户的非安全信息等加密到 access_token 中。

鉴权时，access_token 解密后拿到用户名，通过用户名查询当前用户的所有权限，在方法调用前，使用守卫对当前用户的权限和方法上的权限注解进行比对，一致时允许调用，否则返回403。

### 授权流程

通过用户名和密码登录，授权服务会验证，验证成功后返回 JWT 签名后的 access_token、expires_in

`access_token`：令牌，计算方法：jwt.sign(username, options?))

`expires_in`：令牌有效期，24h

```none
+-----------+                                     +-------------+
|           |       1-Request Authorization       |             |
|           |------------------------------------>|             |
|           |          username&password          |             |--+
|           |                                     |Authorization|  | 2-Gen
|  Client   |                                     |   Service   |  |   JWT
|           |       3-Response Authorization      |             |<-+
|           |<------------------------------------| Private Key |
|           |       access_token  expires_in      |             |
|           |                                     |             |
+-----------+                                     +-------------+
```

### 鉴权流程

请求时，在请求头设置 Authentication: Bearer xxxxxx，资源服务对 Access Token 进行验证（解密），成功后拿到用户名，通过用户名查询当前用户的所有权限，在方法调用前，使用守卫对当前用户的权限和方法上的权限注解进行比对，如果一致，则代表本次请求的用户拥有对当前资源操作的权限，否则拒绝请求

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

#### 注解加载机制

程序加载模块时，将把类和方法上的注解值保存到数据库，超级管理员登录后台后，即可创建用户，角色，然后给角色分配权限或具体的操作，最终把角色分配给用户

用户在注册时，管理员可以定义默认的角色及其所拥有的权限