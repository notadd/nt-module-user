import { Repository } from 'typeorm';
import { Resource } from '../entities/resource.entity';
export declare class ResourceService {
    private readonly resourceRep;
    constructor(resourceRep: Repository<Resource>);
    findResources(): Promise<Resource[]>;
}
//# sourceMappingURL=resource.service.d.ts.map