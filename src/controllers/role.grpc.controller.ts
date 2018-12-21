import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { Role } from '../entities/role.entity';
import { RoleService } from '../services/role.service';

@Controller()
export class RoleGrpcController {
    constructor(
        private readonly roleService: RoleService
    ) { }

    @GrpcMethod('RoleService')
    async createRole(payload: { name: string }) {
        await this.roleService.createRole(payload.name);
        return { code: 200, message: t('Create a role successfully') };
    }

    @GrpcMethod('RoleService')
    async deleteRole(payload: { id: number }) {
        await this.roleService.deleteRole(payload.id);
        return { code: 200, message: t('Delete role successfully') };
    }

    @GrpcMethod('RoleService')
    async updateRole(payload: { id: number, name: string }) {
        await this.roleService.updateRole(payload.id, payload.name);
        return { code: 200, message: t('Update role successfully') };
    }

    @GrpcMethod('RoleService')
    async removePermissionOfRole(payload: { roleId: number, permissionId: number }) {
        await this.roleService.removePermission(payload.roleId, payload.permissionId);
        return { code: 200, message: t('Remove permission from role successfully') };
    }

    @GrpcMethod('RoleService')
    async setPermissionsToRole(payload: { roleId: number, permissionIds: number[] }) {
        await this.roleService.setPermissions(payload.roleId, payload.permissionIds);
        return { code: 200, message: t('Set role permissions successfully') };
    }

    @GrpcMethod('RoleService')
    async findRoles(payload: { pageNumber: number, pageSize: number }) {
        const result = await this.roleService.findRoles(payload.pageNumber, payload.pageSize);
        let data: Role[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [Role[], number])[0];
            count = (result as [Role[], number])[1];
        } else {
            data = result as Role[];
        }
        return { code: 200, message: t('Query all roles successfully'), data, count };
    }

    @GrpcMethod('RoleService')
    async findOneRoleInfo(payload: { roleId: number }) {
        const data = await this.roleService.findOneRoleInfo(payload.roleId);
        return { code: 200, message: t('Query role information successfully'), data };
    }
}