import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { RoleService } from './../services/role.service';

@Resolver()
@Resource({ name: 'role_manage', identify: 'role:manage' })
export class RoleResolver {
    constructor(
        private readonly roleService: RoleService
    ) { }

    @Mutation('createRole')
    @Permission({ name: 'create_role', identify: 'role:createRole', action: 'create' })
    async createRole(req, body: { name: string }): Promise<CommonResult> {
        await this.roleService.createRole(body.name);
        return { code: 200, message: t('Create a role successfully') };
    }

    @Mutation('deleteRole')
    @Permission({ name: 'delete_role', identify: 'role:deleteRole', action: 'delete' })
    async deleteRole(req, body: { id: number }): Promise<CommonResult> {
        await this.roleService.deleteRole(body.id);
        return { code: 200, message: t('Delete role successfully') };
    }

    @Mutation('updateRole')
    @Permission({ name: 'update_role', identify: 'role:updateRole', action: 'update' })
    async updateRole(req, body: { id: number, name: string }): Promise<CommonResult> {
        await this.roleService.updateRole(body.id, body.name);
        return { code: 200, message: t('Update role successfully') };
    }

    @Mutation('setPermissionsToRole')
    @Permission({ name: 'set_permissions_to_role', identify: 'role:setPermissionsToRole', action: 'create' })
    async setPermissionsToRole(req, body: { roleId: number, permissionIds: number[] }): Promise<CommonResult> {
        await this.roleService.setPermissions(body.roleId, body.permissionIds);
        return { code: 200, message: t('Set role permissions successfully') };
    }

    @Query('findRoles')
    @Permission({ name: 'find_roles', identify: 'role:findRoles', action: 'find' })
    async findRoles(): Promise<CommonResult> {
        const data = await this.roleService.findRoles();
        return { code: 200, message: t('Query all roles successfully'), data };
    }

    @Query('findOneRoleInfo')
    @Permission({ name: 'find_one_role_info', identify: 'role:findOneRoleInfo', action: 'find' })
    async findOneRoleInfo(req, body: { roleId: number }): Promise<CommonResult> {
        const data = await this.roleService.findOneRoleInfo(body.roleId);
        return { code: 200, message: t('Query role information successfully'), data };
    }
}