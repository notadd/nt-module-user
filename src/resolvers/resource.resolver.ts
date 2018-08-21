import { Query, Resolver } from '@nestjs/graphql';

import { Permission, Resource } from '../decorators';
import { ResourceService } from '../services/resource.service';

@Resolver()
@Resource({ name: '资源管理', identify: 'resource:manage' })
export class ResourceResolver {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @Query('findResources')
    @Permission({ name: '查询资源', identify: 'resource:findResources', action: 'find' })
    async findResources(req, body) {
        const resourceArr = await this.resourceService.findResources();
        return { code: 200, message: '获取成功', data: resourceArr };
    }
}