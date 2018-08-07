import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../auth';
import { CommonResult } from '../interfaces';
import { UserService } from '../services/user.service';

@Resolver()
export class UserResolver {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        @Inject(UserService) private readonly userService: UserService
    ) { }

    @Query('login')
    async login(req, body: { username: string, password: string }): Promise<CommonResult> {
        const data = await this.userService.login(body.username, body.password);
        return { code: 200, message: '登录成功', data };
    }

    @Mutation('register')
    async register(req, body: { username: string, password: string }): Promise<CommonResult> {
        await this.userService.register(body.username, body.password);
        return { code: 200, message: '注册成功' };
    }
}