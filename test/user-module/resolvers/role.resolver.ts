import { Mutation, Resolver } from '@nestjs/graphql';

import { Permission } from '../decorators/permission.decorator.test';
import { Resource } from '../decorators/resource.decorator.test';

@Resource({ name: '角色管理', identify: 'role:manage' })
@Resolver()
export class RoleResolver {
    @Permission({ name: '添加角色', identify: 'createRole', action: 'create' })
    @Mutation('createRole')
    async createRole(req, body: { username: string, password: string }) {
        console.log(body);
    }
}