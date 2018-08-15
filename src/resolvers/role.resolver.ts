import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleService } from './../services/role.service';

@Resolver()
export class RoleResolver {
    constructor(
        private readonly roleService: RoleService
    ) { }

    @Query('findRoles')
    async findRoles(req, body) {
        const roleArr = await this.roleService.findRoles();
        return { code: 200, message: '获取角色成功', data: roleArr };
    }

    @Mutation('createRole')
    async createRole(req, body: { name: string }) {
        const { name } = body;
        await this.roleService.createRole(name);
        return { code: 200, message: '创建角色成功' };
    }

    @Mutation('updateRole')
    async updateRole(req, body: { id: number, name: string }) {
        const { id, name } = body;
        await this.roleService.updateRole(id, name);
        return { code: 200, message: '更新角色成功' };
    }

    @Mutation('deleteRole')
    async deleteRole(req, body: { id: number }) {
        const { id } = body;
        await this.roleService.deleteRole(id);
        return { code: 200, message: '删除角色成功' };
    }

    @Mutation('setPermissionsToRole')
    async setPermissionsToRole(req, body: { roleId: number, permissionIds: number[] }) {
        const { roleId, permissionIds } = body;
        await this.roleService.setPermissions(roleId, permissionIds);
        return { code: 200, message: '设置权限成功' };
    }
}