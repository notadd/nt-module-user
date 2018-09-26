import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Controller()
export class UserGrpcController {
    constructor(
        @Inject(UserService) private readonly userService: UserService
    ) { }

    @GrpcMethod('UserService')
    async login(payload: { username: string, password: string }) {
        const data = await this.userService.login(payload.username, payload.password);
        return { code: 200, message: t('Login success'), data };
    }

    @GrpcMethod('UserService')
    async register(payload: { registerUserInput: CreateUserInput }) {
        await this.userService.register(payload.registerUserInput);
        return { code: 200, message: t('Registration success') };
    }

    @GrpcMethod('UserService')
    async createUser(payload: { createUserInput: CreateUserInput }) {
        await this.userService.createUser(payload.createUserInput);
        return { code: 200, message: t('Create user successfully') };
    }

    @GrpcMethod('UserService')
    async addUserRole(payload: { userId: number, roleId: number }) {
        await this.userService.addUserRole(payload.userId, payload.roleId);
        return { code: 200, message: t('Add user role successfully') };
    }

    @GrpcMethod('UserService')
    async deleteUserRole(payload: { userId: number, roleId: number }) {
        await this.userService.deleteUserRole(payload.userId, payload.roleId);
        return { code: 200, message: t('Delete user role successfully') };
    }

    @GrpcMethod('UserService')
    async banUser(payload: { userId: number }) {
        await this.userService.recycleOrBanUser(payload.userId, 'ban');
        return { code: 200, message: t('Ban User successfully') };
    }

    @GrpcMethod('UserService')
    async recycleUser(payload: { userId: number }) {
        await this.userService.recycleOrBanUser(payload.userId, 'recycle');
        return { code: 200, message: t('Delete user to recycle bin successfully') };
    }

    @GrpcMethod('UserService')
    async deleteRecycledUser(payload: { userId: number }) {
        await this.userService.deleteUser(payload.userId);
        return { code: 200, message: t('Delete user in the recycle bin successfully') };
    }

    @GrpcMethod('UserService')
    async revertBannedUser(payload: { userId: number }) {
        await this.userService.revertBannedOrRecycledUser(payload.userId, 'banned');
        return { code: 200, message: t('Revert banned user successfully') };
    }

    @GrpcMethod('UserService')
    async revertRecycledUser(payload: { userId: number }) {
        await this.userService.revertBannedOrRecycledUser(payload.userId, 'recycled');
        return { code: 200, message: t('Revert recycled user successfully') };
    }

    @GrpcMethod('UserService')
    async updateUserInfoById(payload: { userId: number, updateUserInput: UpdateUserInput }) {
        await this.userService.updateUserInfo(payload.userId, payload.updateUserInput);
        return { code: 200, message: t('Update user information successfully') };
    }

    @GrpcMethod('UserService')
    async updateCurrentUserInfo(payload: { userId: number, updateCurrentUserInput: UpdateUserInput }, context) {
        await this.userService.updateUserInfo(payload.userId, payload.updateCurrentUserInput);
        return { code: 200, message: t('Update current login user information successfully') };
    }

    @GrpcMethod('UserService')
    async findUserInfoByIds(payload: { userIds: number[] }) {
        const data = await this.userService.findUserInfoById(payload.userIds) as UserInfoData[];
        return { code: 200, message: t('Query the specified users information successfully'), data };
    }

    @GrpcMethod('UserService')
    async findCurrentUserInfo(payload: { userId: number }) {
        const data = await this.userService.findUserInfoById(payload.userId) as UserInfoData;
        return { code: 200, message: t('Query the current login user information successfully'), data };
    }

    @GrpcMethod('UserService')
    async findRegisterUserInputInfo() {
        const data = await this.userService.findOneWithInfoItemsByRoleIds([1]);
        return { code: 200, message: t('Query user registration information item successfully'), data };
    }

    @GrpcMethod('UserService')
    async findUsersInRole(payload: { roleId: number }) {
        const data = await this.userService.findByRoleId(payload.roleId);
        return { code: 200, message: t('Query the user under the role successfully'), data };
    }

    @GrpcMethod('UserService')
    async findUsersInOrganization(payload: { organizationId: number }) {
        const data = await this.userService.findByOrganizationId(payload.organizationId);
        return { code: 200, message: t('Query users under the organization successfully'), data };
    }

    @GrpcMethod('UserService')
    async findOneWithRolesAndPermissions(payload: { username: string }) {
        const data = await this.userService.findOneWithRolesAndPermissions(payload.username);
        return { code: 200, message: t('Query users roles and permissions successfully'), data };
    }

    @GrpcMethod('UserService')
    async addPermissionToUser(payload: { userId: number, permissionId: number }) {
        await this.userService.addPermissionToUser(payload.userId, payload.permissionId);
        return { code: 200, message: t('Add permission to user successfully') };
    }

    @GrpcMethod('UserService')
    async deletePermissionOfUser(payload: { userId: number, permissionId: number }) {
        await this.userService.deletePermissionOfUser(payload.userId, payload.permissionId);
        return { code: 200, message: t('Delete permission of user successfully') };
    }
}