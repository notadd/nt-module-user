import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../auth';
import { UserService } from '../services/user.service';

@Resolver()
export class UserResolver {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        @Inject(UserService) private readonly userService: UserService
    ) { }

    @Query('login')
    async login(req, body: { username: string, password: string }) {
        const data = await this.userService.login(body.username, body.password);
        return { code: 200, message: '登录成功', data };
    }

    // @Mutation('register')
    // async register(req, body: { username: string, pasword: string, info: any }) {
    //     // TODO: 注册时，用户信息是不确定的？？？
    // }
}