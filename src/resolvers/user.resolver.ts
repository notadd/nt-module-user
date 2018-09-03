import { Inject, UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthorizationGurad } from '../auth/authorization.gurad';
import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Resolver()
@UseGuards(AuthorizationGurad)
@Resource({ name: '用户管理', identify: 'user:manage' })
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
    @Permission({ name: '创建用户', identify: 'user:createUser', action: 'create' })
    async createUser(req, body: { createUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.createUser(body.createUserInput);
        return { code: 200, message: '创建用户成功' };
    }

    @Mutation('addUserRole')
    @Permission({ name: '添加用户角色', identify: 'user:addUserRole', action: 'create' })
    async addUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.addUserRole(body.userId, body.roleId);
        return { code: 200, message: '添加角色成功' };
    }

    @Mutation('deleteUserRole')
    @Permission({ name: '删除用户角色', identify: 'user:deleteUserRole', action: 'delete' })
    async deleteUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.deleteUserRole(body.userId, body.roleId);
        return { code: 200, message: '删除角色成功' };
    }

    @Mutation('recycleUser')
    @Permission({ name: '删除用户到回收站', identify: 'user:recycleUser', action: 'delete' })
    async recycleUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.recycleUser(body.userId);
        return { code: 200, message: '删除用户到回收站成功' };
    }

    @Mutation('deleteRecycledUser')
    @Permission({ name: '删除回收站内的用户', identify: 'user:deleteRecycledUser', action: 'delete' })
    async deleteRecycledUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.deleteUser(body.userId);
        return { code: 200, message: '删除回收站内的用户成功' };
    }

    @Mutation('updateUserInfoById')
    @Permission({ name: '更新指定用户信息', identify: 'user:updateUserInfoById', action: 'update' })
    async updateUserInfo(req, body: { userId: number, updateUserInput: UpdateUserInput }): Promise<CommonResult> {
        await this.userService.updateUserInfo(body.userId, body.updateUserInput);
        return { code: 200, message: '更新用户信息成功' };
    }

    @Mutation('updateCurrentUserInfo')
    async updateCurrentUserInfo(req, body: { updateCurrentUserInput: UpdateUserInput }, context): Promise<CommonResult> {
        await this.userService.updateUserInfo(context.user.id, body.updateCurrentUserInput);
        return { code: 200, message: '更新当前登录用户信息成功' };
    }

    @Query('findUserInfoById')
    @Permission({ name: '查询指定用户信息', identify: 'user:findUserInfoById', action: 'find' })
    async findUserInfoById(req, body: { userId: number }): Promise<CommonResult> {
        const data = await this.userService.findUserInfoById(body.userId) as UserInfoData;
        return { code: 200, message: '查询用户信息成功', data };
    }

    @Query('findCurrentUserInfo')
    async findCurrentUserInfo(req, body, context): Promise<CommonResult> {
        const data = await this.userService.findUserInfoById(context.user.id);
        return { code: 200, message: '查询当前登录用户信息成功', data };
    }

    @Query('findRegisterUserInfoItem')
    async findRegisterUserInputInfo(): Promise<CommonResult> {
        const data = await this.userService.findOneWithInfoItemsByRoleIds([1]);
        return { code: 200, message: '查询用户注册信息项成功', data };
    }

    @Query('findUsersInRole')
    @Permission({ name: '查询角色下的用户', identify: 'user:findUsersInRole', action: 'find' })
    async findUsersInRole(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.userService.findByRoleId(body.roleId);
        return { code: 200, message: '获取角色下的用户成功', data };
    }

    @Query('findUsersInOrganization')
    @Permission({ name: '查询组织下的用户', identify: 'user:findUsersInOrganization', action: 'find' })
    async findUsersInOrganization(req, body: { organizationId: number }): Promise<CommonResult> {
        const data = await this.userService.findByOrganizationId(body.organizationId);
        return { code: 200, message: '获取组织下的用户成功', data };
    }
}