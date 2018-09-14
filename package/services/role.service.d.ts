import { Repository } from 'typeorm';
import { InfoItem } from '../entities/info-item.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RoleInfoData } from '../interfaces/role.interface';
import { EntityCheckService } from './entity-check.service';
export declare class RoleService {
    private readonly entityCheckService;
    private readonly roleRepo;
    private readonly permissionRepo;
    constructor(entityCheckService: EntityCheckService, roleRepo: Repository<Role>, permissionRepo: Repository<Permission>);
    createRole(name: string): Promise<void>;
    updateRole(id: number, name: string): Promise<void>;
    deleteRole(id: number): Promise<void>;
    setPermissions(id: number, permissionIds: number[]): Promise<void>;
    findRoles(): Promise<Role[]>;
    findOneRoleInfo(roleId: number): Promise<RoleInfoData>;
    findInfoGroupItemsByIds(ids: number[]): Promise<InfoItem[]>;
}
//# sourceMappingURL=role.service.d.ts.map