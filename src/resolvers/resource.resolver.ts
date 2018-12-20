import { Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { Resource as ResourceEntity } from '../entities/resource.entity';
import { ResourceService } from '../services/resource.service';

@Resolver()
@Resource({ name: 'resource_manage', identify: 'resource:manage' })
export class ResourceResolver {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @Query('findResources')
    @Permission({ name: 'find_resources', identify: 'resource:findResources', action: 'find' })
    async findResources(req, body: { systemModuleId: number, pageNumber: number, pageSize: number }) {
        const result = await this.resourceService.findResources(body.systemModuleId, body.pageNumber, body.pageSize);
        let data: ResourceEntity[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [ResourceEntity[], number])[0];
            count = (result as [ResourceEntity[], number])[1];
        } else {
            data = result as ResourceEntity[];
        }
        return { code: 200, message: t('Query the resource successfully'), data, count };
    }
}