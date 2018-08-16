import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { CommonResult } from '../interfaces/common-result.interface';
import { RoleService } from './../services/role.service';

@Resolver()
export class RoleResolver {
    constructor(
        private readonly roleService: RoleService
    ) { }

    @Mutation('createRole')
    async createRole(req, body: { name: string }): Promise<CommonResult> {
        const { name } = body;
        await this.roleService.createRole(name);
        return { code: 200, message: '创建角色成功' };
    }

    @Mutation('deleteRole')
    async deleteRole(req, body: { id: number }): Promise<CommonResult> {
        const { id } = body;
        await this.roleService.deleteRole(id);
        return { code: 200, message: '删除角色成功' };
    }

    @Mutation('updateRole')
    async updateRole(req, body: { id: number, name: string }): Promise<CommonResult> {
        const { id, name } = body;
        await this.roleService.updateRole(id, name);
        return { code: 200, message: '更新角色成功' };
    }

    @Mutation('setPermissionsToRole')
    async setPermissionsToRole(req, body: { roleId: number, permissionIds: number[] }): Promise<CommonResult> {
        const { roleId, permissionIds } = body;
        await this.roleService.setPermissions(roleId, permissionIds);
        return { code: 200, message: '设置权限成功' };
    }

    @Query('findRoles')
    async findRoles(): Promise<CommonResult> {
        const roleArr = await this.roleService.findRoles();
        return { code: 200, message: '查询所有角色成功', data: roleArr };
    }

    @Query('findOneRoleInfo')
    async findOneRoleInfo(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.roleService.findOneRoleInfo(body.roleId);
        return { code: 200, message: '查询角色信息成功', data };
    }
}