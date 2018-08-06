import { Mutation, Resolver } from '@nestjs/graphql';

import { Permission } from '../decorators/permission.decorator.test';
import { Resource } from '../decorators/resource.decorator.test';

@Resource({ name: '用户管理', identify: 'user:manage' })
@Resolver()
export class UserResolver {
    @Permission({ name: '添加用户', identify: 'user:createUser', action: 'create' })
    @Mutation('createUser')
    async createUser() {

    }

    @Permission({ name: '删除用户', identify: 'user:deleteUser', action: 'delete' })
    @Mutation('deleteUser')
    async deleteUser() {

    }

    @Permission({ name: '更新用户', identify: 'user:updateUser', action: 'update' })
    @Mutation('updateUser')
    async updateUser() {

    }

    @Permission({ name: '查询用户', identify: 'user:findUser', action: 'find' })
    @Mutation('findUser')
    async findUser() {

    }
}