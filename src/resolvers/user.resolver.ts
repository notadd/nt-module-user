import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { CommonResult } from '../interfaces/common-result.interface';
import { CreateUserInput, UpdateUserInput } from '../interfaces/user.interface';
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
    async register(req, body: { registerUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.register(body.registerUserInput);
        return { code: 200, message: '注册成功' };
    }

    @Mutation('createUser')
    async createUser(req, body: { createUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.createUser(body.createUserInput);
        return { code: 200, message: '创建用户成功' };
    }

    @Mutation('addUserRole')
    async addUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.addUserRole(body.userId, body.roleId);
        return { code: 200, message: '添加角色成功' };
    }

    @Mutation('addUserOrganization')
    async addUserOrganization(req, body: { userId: number, organizationId: number }): Promise<CommonResult> {
        await this.userService.addUserOrganization(body.userId, body.organizationId);
        return { code: 200, message: '添加组织成功' };
    }

    @Mutation('deleteUserRole')
    async deleteUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.deleteUserRole(body.userId, body.roleId);
        return { code: 200, message: '删除角色成功' };
    }

    @Mutation('deleteUserOrganization')
    async deleteUserOrganization(req, body: { userId: number, organizationId: number }): Promise<CommonResult> {
        await this.userService.deleteUserOrganization(body.userId, body.organizationId);
        return { code: 200, message: '删除组织成功' };
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

    @Mutation('updateUserInfo')
    async updateUserInfo(req, body: { userId: number, updateUserInput: UpdateUserInput }): Promise<CommonResult> {
        await this.userService.updateUserInfo(body.userId, body.updateUserInput);
        return { code: 200, message: '更新用户信息成功' };
    }

    @Query('findCurrentUserInfo')
    async findCurrentUserInfo(req): Promise<CommonResult> {
        const data = await this.userService.findUserInfo(req.user.username);
        return { code: 200, message: '查询用户信息成功', data };
    }

    @Query('findUserByRoleId')
    async findUserByRoleId(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.userService.findByRoleId(body.roleId);
        return { code: 200, message: '查询用户成功', data };
    }

    @Query('findRegisterUserInfoItem')
    async findRegisterUserInputInfo(): Promise<CommonResult> {
        const data = await this.userService.findOneWithInfoItemsByRoleIds([1]);
        return { code: 200, message: '查询用户注册信息项成功', data };
    }
}