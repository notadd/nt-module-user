import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthorizationGurad } from '../auth/authorization.gurad';
import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { RoleService } from './../services/role.service';

@Resolver()
@UseGuards(AuthorizationGurad)
@Resource({ name: '角色管理', identify: 'role:manage' })
export class RoleResolver {
    constructor(
        private readonly roleService: RoleService
    ) { }

    @Mutation('createRole')
    @Permission({ name: '创建角色', identify: 'role:createRole', action: 'create' })
    async createRole(req, body: { name: string }): Promise<CommonResult> {
        await this.roleService.createRole(body.name);
        return { code: 200, message: '创建角色成功' };
    }

    @Mutation('deleteRole')
    @Permission({ name: '删除角色', identify: 'role:deleteRole', action: 'delete' })
    async deleteRole(req, body: { id: number }): Promise<CommonResult> {
        await this.roleService.deleteRole(body.id);
        return { code: 200, message: '删除角色成功' };
    }

    @Mutation('updateRole')
    @Permission({ name: '更新角色', identify: 'role:updateRole', action: 'update' })
    async updateRole(req, body: { id: number, name: string }): Promise<CommonResult> {
        await this.roleService.updateRole(body.id, body.name);
        return { code: 200, message: '更新角色成功' };
    }

    @Mutation('setPermissionsToRole')
    @Permission({ name: '设置角色权限', identify: 'role:setPermissionsToRole', action: 'create' })
    async setPermissionsToRole(req, body: { roleId: number, permissionIds: number[] }): Promise<CommonResult> {
        await this.roleService.setPermissions(body.roleId, body.permissionIds);
        return { code: 200, message: '设置权限成功' };
    }

    @Query('findRoles')
    @Permission({ name: '查询所有角色', identify: 'role:findRoles', action: 'find' })
    async findRoles(): Promise<CommonResult> {
        const data = await this.roleService.findRoles();
        return { code: 200, message: '查询所有角色成功', data };
    }

    @Query('findOneRoleInfo')
    @Permission({ name: '查询角色信息', identify: 'role:findOneRoleInfo', action: 'find' })
    async findOneRoleInfo(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.roleService.findOneRoleInfo(body.roleId);
        return { code: 200, message: '查询角色信息成功', data };
    }
}