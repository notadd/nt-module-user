import { CommonResult } from '../interfaces/common-result.interface';
import { RoleService } from './../services/role.service';
export declare class RoleResolver {
    private readonly roleService;
    constructor(roleService: RoleService);
    createRole(req: any, body: {
        name: string;
    }): Promise<CommonResult>;
    deleteRole(req: any, body: {
        id: number;
    }): Promise<CommonResult>;
    updateRole(req: any, body: {
        id: number;
        name: string;
    }): Promise<CommonResult>;
    setPermissionsToRole(req: any, body: {
        roleId: number;
        permissionIds: number[];
    }): Promise<CommonResult>;
    findRoles(): Promise<CommonResult>;
    findOneRoleInfo(req: any, body: {
        roleId: number;
    }): Promise<CommonResult>;
}