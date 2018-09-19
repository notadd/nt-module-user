import { CommonResult } from '../interfaces/common-result.interface';
import { ResourceService } from '../services/resource.service';
export declare class ResourceResolver {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    findResources(req: any, body: {
        systemModuleId: number;
    }): Promise<CommonResult>;
}
//# sourceMappingURL=resource.resolver.d.ts.map