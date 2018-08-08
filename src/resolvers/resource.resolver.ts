import { Resolver, Query } from '@nestjs/graphql';
import { ResourceService } from '../services/resource.service';

@Resolver()
export class ResourceResolver {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @Query('findResources')
    async findResources(req, body) {
        const resourceArr = await this.resourceService.findResources();
        return { code: 200, message: '获取成功', data: resourceArr };
    }
}