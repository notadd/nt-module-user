import { CommonResult } from '../interfaces/common-result.interface';
import { OrganizationService } from './../services/organization.service';
export declare class OrganizationResolver {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    findRootOrganizations(): Promise<CommonResult>;
    findAllOrganizations(): Promise<CommonResult>;
    findChildrenOrganizations(req: any, body: {
        id: number;
    }): Promise<CommonResult>;
    createOrganization(req: any, body: {
        name: string;
        parentId: number;
    }): Promise<CommonResult>;
    updateOrganization(req: any, body: {
        id: number;
        name: string;
        parentId: number;
    }): Promise<CommonResult>;
    deleteOrganization(req: any, body: {
        id: number;
    }): Promise<CommonResult>;
    addUsersToOrganization(req: any, body: {
        id: number;
        userIds: number[];
    }): Promise<CommonResult>;
    deleteUserFromOrganization(req: any, body: {
        id: number;
        userIds: number[];
    }): Promise<CommonResult>;
}
//# sourceMappingURL=organization.resolver.d.ts.map