import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { CommonResult } from '../interfaces/common-result.interface';
import { CreateUserInput } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Resolver()
export class UserResolver {
    constructor(
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

    @Mutation('createUser')
    async createUser(req, body: { createUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.createUser(body.createUserInput);
        return { code: 200, message: '添加用户成功' };
    }

    @Mutation('recycleUser')
    async recycleUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.recycleUser(body.userId);
        return { code: 200, message: '删除用户到回收站成功' };
    }

    @Mutation('deleteRecycledUser')
    async deleteRecycledUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.deleteUser(body.userId);
        return { code: 200, message: '删除回收站内的用户成功' };
    }
}