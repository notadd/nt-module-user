import { Resource as ResourceEntity } from '../entities/resource.entity';
import { ResourceService } from '../services/resource.service';
export declare class ResourceResolver {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    findResources(req: any, body: {
        systemModuleId: number;
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        code: number;
        message: string;
        data: ResourceEntity[];
        count: number;
    }>;
}
