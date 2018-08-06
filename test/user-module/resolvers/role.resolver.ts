import { Mutation, Resolver } from '@nestjs/graphql';

import { Permission } from '../decorators/permission.decorator.test';
import { Resource } from '../decorators/resource.decorator.test';

@Resource({ name: '角色管理', identify: 'role:manage' })
@Resolver()
export class RoleResolver {
    @Permission({ name: '添加角色', identify: 'role:createRole', action: 'create' })
    @Mutation('createRole')
    async createRole() {

    }

    @Permission({ name: '删除角色', identify: 'role:deleteRole', action: 'delete' })
    @Mutation('deleteRole')
    async deleteRole() {

    }

    @Permission({ name: '更新角色', identify: 'role:updateRole', action: 'update' })
    @Mutation('updateRole')
    async updateRole() {

    }

    @Permission({ name: '查询角色', identify: 'role:findRole', action: 'find' })
    @Mutation('findRole')
    async findRole() {

    }
}