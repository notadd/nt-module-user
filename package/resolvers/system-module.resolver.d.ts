import { CommonResult } from '../interfaces/common-result.interface';
import { SystemModuleService } from '../services/system-module.service';
export declare class SystemModuleResolver {
    private readonly systemModuleService;
    constructor(systemModuleService: SystemModuleService);
    findSystemModules(): Promise<CommonResult>;
}
//# sourceMappingURL=system-module.resolver.d.ts.map