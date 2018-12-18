import { CommonResult } from '../interfaces/common-result.interface';
import { InfoGroupService } from '../services/info-group.service';
export declare class InfoGroupResolver {
    private readonly infoGroupService;
    constructor(infoGroupService: InfoGroupService);
    createInfoGroup(req: any, body: {
        name: string;
        roleId: number;
    }): Promise<CommonResult>;
    deleteInfoGroup(req: any, body: {
        groupId: number;
    }): Promise<CommonResult>;
    updateInfoGroup(req: any, body: {
        groupId: number;
        name: string;
        roleId: number;
    }): Promise<CommonResult>;
    addInfoItemToInfoGroup(req: any, body: {
        infoGroupId: number;
        infoItemIds: number[];
    }): Promise<CommonResult>;
    deleteIntoItemFromInfoGroup(req: any, body: {
        infoGroupId: number;
        infoItemIds: number[];
    }): Promise<CommonResult>;
    findAllInfoGroup(): Promise<CommonResult>;
    findInfoItemsByGroupId(req: any, body: {
        groupId: number;
    }): Promise<CommonResult>;
}
