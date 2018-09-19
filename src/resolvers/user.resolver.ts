import { HttpException, Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Resolver()
@Resource({ name: 'user_manage', identify: 'user:manage' })
export class UserResolver {
    constructor(
        @Inject(UserService) private readonly userService: UserService
    ) { }

    @Query('login')
    async login(req, body: { username: string, password: string }): Promise<CommonResult> {
        let data;
        if (!parseInt(body.password)) {
            data = await this.userService.login(body.username, body.password);
        } else if (parseInt(body.password)) {
            data = await this.userService.mobileLogin(body.username, parseInt(body.password));
        }
        return { code: 200, message: t('Login success'), data: data.tokenInfo };
    }

    @Query('adminLogin')
    async adminLogin(req, body: { username: string, password: string }): Promise<CommonResult> {
        let data;
        if (!parseInt(body.password)) {
            data = await this.userService.login(body.username, body.password);
        } else if (parseInt(body.password)) {
            data = await this.userService.mobileLogin(body.username, parseInt(body.password));
        }
        const userInfoData = data.userInfoData;
        if (userInfoData.username !== 'sadmin' && userInfoData.userRoles.map(v => v.id).includes(1)) {
            throw new HttpException(t('You are not authorized to access'), 401);
        }
        return { code: 200, message: t('Login success'), data: data.tokenInfo };
    }

    @Mutation('register')
    async register(req, body: { registerUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.register(body.registerUserInput);
        return { code: 200, message: t('Registration success') };
    }

    @Mutation('createUser')
    @Permission({ name: 'create_user', identify: 'user:createUser', action: 'create' })
    async createUser(req, body: { createUserInput: CreateUserInput }): Promise<CommonResult> {
        await this.userService.createUser(body.createUserInput);
        return { code: 200, message: t('Create user successfully') };
    }

    @Mutation('addUserRole')
    @Permission({ name: 'add_user_role', identify: 'user:addUserRole', action: 'create' })
    async addUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.addUserRole(body.userId, body.roleId);
        return { code: 200, message: t('Add user role successfully') };
    }

    @Mutation('deleteUserRole')
    @Permission({ name: 'delete_user_role', identify: 'user:deleteUserRole', action: 'delete' })
    async deleteUserRole(req, body: { userId: number, roleId: number }): Promise<CommonResult> {
        await this.userService.deleteUserRole(body.userId, body.roleId);
        return { code: 200, message: t('Delete user role successfully') };
    }

    @Mutation('banUser')
    @Permission({ name: 'ban_user', identify: 'user:banUser', action: 'update' })
    async banUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.recycleOrBanUser(body.userId, 'recycle');
        return { code: 200, message: t('Ban user successfully') };
    }

    @Mutation('recycleUser')
    @Permission({ name: 'recycle_user', identify: 'user:recycleUser', action: 'update' })
    async recycleUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.recycleOrBanUser(body.userId, 'recycle');
        return { code: 200, message: t('Delete user to recycle bin successfully') };
    }

    @Mutation('deleteRecycledUser')
    @Permission({ name: 'delete_recycled_user', identify: 'user:deleteRecycledUser', action: 'delete' })
    async deleteRecycledUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.deleteUser(body.userId);
        return { code: 200, message: t('Delete user in the recycle bin successfully') };
    }

    @Mutation('revertBannedUser')
    @Permission({ name: 'revert_banned_user', identify: 'user:revertBannedUser', action: 'update' })
    async revertBannedUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.revertBannedOrRecycledUser(body.userId, 'banned');
        return { code: 200, message: t('Revert banned user successfully') };
    }

    @Mutation('revertRecycledUser')
    @Permission({ name: 'revert_recycled_user', identify: 'user:revertRecycledUser', action: 'update' })
    async revertRecycledUser(req, body: { userId: number }): Promise<CommonResult> {
        await this.userService.revertBannedOrRecycledUser(body.userId, 'recycled');
        return { code: 200, message: t('Revert recycled user successfully') };
    }

    @Mutation('updateUserInfoById')
    @Permission({ name: 'update_user_info_by_id', identify: 'user:updateUserInfoById', action: 'update' })
    async updateUserInfo(req, body: { userId: number, updateUserInput: UpdateUserInput }): Promise<CommonResult> {
        await this.userService.updateUserInfo(body.userId, body.updateUserInput);
        return { code: 200, message: t('Update user information successfully') };
    }

    @Mutation('updateCurrentUserInfo')
    async updateCurrentUserInfo(req, body: { updateCurrentUserInput: UpdateUserInput }, context): Promise<CommonResult> {
        await this.userService.updateUserInfo(context.user.id, body.updateCurrentUserInput);
        return { code: 200, message: t('Update current login user information successfully') };
    }

    @Query('findUserInfoByIds')
    @Permission({ name: 'find_user_info_by_ids', identify: 'user:findUserInfoByIds', action: 'find' })
    async findUserInfoById(req, body: { userIds: number[] }): Promise<CommonResult> {
        const data = await this.userService.findUserInfoById(body.userIds) as UserInfoData[];
        return { code: 200, message: t('Query the specified users information successfully'), data };
    }

    @Query('findCurrentUserInfo')
    async findCurrentUserInfo(req, body, context): Promise<CommonResult> {
        const data = await this.userService.findUserInfoById(context.user.id) as UserInfoData;
        return { code: 200, message: t('Query the current login user information successfully'), data };
    }

    @Query('findRegisterUserInfoItem')
    async findRegisterUserInputInfo(): Promise<CommonResult> {
        const data = await this.userService.findOneWithInfoItemsByRoleIds([1]);
        return { code: 200, message: t('Query user registration information item successfully'), data };
    }

    @Query('findUsersInRole')
    @Permission({ name: 'find_users_in_role', identify: 'user:findUsersInRole', action: 'find' })
    async findUsersInRole(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.userService.findByRoleId(body.roleId);
        return { code: 200, message: t('Query the user under the role successfully'), data };
    }

    @Query('findUsersInOrganization')
    @Permission({ name: 'find_users_in_organization', identify: 'user:findUsersInOrganization', action: 'find' })
    async findUsersInOrganization(req, body: { organizationId: number }): Promise<CommonResult> {
        const data = await this.userService.findByOrganizationId(body.organizationId);
        return { code: 200, message: t('Query users under the organization successfully'), data };
    }
}