import { Repository, TreeRepository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { EntityCheckService } from './entity-check.service';
export declare class OrganizationService {
    private readonly entityCheckService;
    private readonly organizationReq;
    private readonly userRep;
    constructor(entityCheckService: EntityCheckService, organizationReq: TreeRepository<Organization>, userRep: Repository<User>);
    findRoots(): Promise<Organization[]>;
    findAllTrees(): Promise<Organization[]>;
    findChildren(id: number): Promise<Organization>;
    createOrganization(name: string, parentId: number): Promise<void>;
    updateOrganization(id: number, name: string, parentId: number): Promise<void>;
    deleteOrganization(id: number): Promise<void>;
    addUsersToOrganization(id: number, userIds: number[]): Promise<void>;
    deleteUserFromOrganization(id: number, userIds: number[]): Promise<void>;
}
