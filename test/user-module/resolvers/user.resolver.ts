import { Mutation, Resolver } from '@nestjs/graphql';

import { Permission } from '../../decorators/permission.decorator.test';
import { Source } from '../../decorators/source.decorator.test';

@Source({ name: '用户管理', identify: 'user:manage' })
@Resolver()
export class UserResolver {
    @Permission({ name: '添加用户', identify: 'createUser', action: 'create' })
    @Mutation('createUser')
    async createUser(req, body: { username: string, password: string }) {
        console.log(body);
    }
}