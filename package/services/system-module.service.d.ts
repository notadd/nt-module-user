import { Repository } from 'typeorm';
import { SystemModule } from '../entities/system-module.entity';
export declare class SystemModuleService {
    private readonly systemModuleRepo;
    constructor(systemModuleRepo: Repository<SystemModule>);
    findSystemModules(pageNumber?: number, pageSize?: number): Promise<SystemModule[] | [SystemModule[], number]>;
}
