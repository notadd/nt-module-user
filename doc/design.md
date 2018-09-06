# User Module Design Document

## Implementation logic overview

When logging in, the user name, the user's non-secure information, etc. can be encrypted into the access_token.

When authenticating, the access_token decrypts the user name, and queries the current user's permissions through the user name. Before the method is called, the guard uses the authority to compare the current user's permission with the method's permission annotation. If it is consistent, it is allowed to be called. Otherwise, it is returned. 403.

### Authorization process

Log in with the username and password, the authorization service will verify, and the JWT signed access_token, expires_in will be returned after successful authorization.

`access_token`: token, calculation method: jwt.sign(username, options?))

`expires_in`: token validity period, 24h

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

### Authentication process

When requesting, set Authentication: Bearer xxxxxx in the request header, the resource service authenticates (decrypts) the Access Token, and after successful, obtains the username, queries all permissions of the current user by username, and uses the guard to the current user before the method is called. The permissions are compared with the permission annotations on the method. If they are consistent, the user representing the request has permission to operate on the current resource, otherwise the request is denied.

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

#### Annotation loading mechanism

When the program loads the module, the annotation values on the class and method will be saved to the database. After the super administrator logs in to the background, the user, role, and then assign permissions or specific operations to the role, and finally assign the role to the user.

When a user registers, the administrator can define the default role and the permissions it has.