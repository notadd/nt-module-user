import { Module } from '@nestjs/common';

import { RoleResolver } from '../resolvers/role.resolver';
import { UserResolver } from '../resolvers/user.resolver';

@Module({
    providers: [RoleResolver, UserResolver]
})
export class UserModule { }