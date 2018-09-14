import { InfoItem } from '../entities/info-item.entity';
import { CommonResult } from '../interfaces/common-result.interface';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { InfoItemService } from '../services/info-item.service';
export declare class InfoItemResolver {
    private readonly infoItemService;
    constructor(infoItemService: InfoItemService);
    createInfoItem(req: any, body: {
        infoItemInput: InfoItem;
    }): Promise<CommonResult>;
    deleteInfoItem(req: any, body: {
        infoItemId: number;
    }): Promise<CommonResult>;
    updateInfoItem(req: any, body: {
        updateInfoItemInput: UpdateInfoItemInput;
    }): Promise<CommonResult>;
    findAllInfoItem(): Promise<CommonResult>;
}
//# sourceMappingURL=info-item.resolver.d.ts.map