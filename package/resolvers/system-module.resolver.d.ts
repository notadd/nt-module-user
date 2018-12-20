import { SystemModule } from '../entities/system-module.entity';
import { SystemModuleService } from '../services/system-module.service';
export declare class SystemModuleResolver {
    private readonly systemModuleService;
    constructor(systemModuleService: SystemModuleService);
    findSystemModules(req: any, body: {
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        code: number;
        message: string;
        data: SystemModule[];
        count: number;
    }>;
}
