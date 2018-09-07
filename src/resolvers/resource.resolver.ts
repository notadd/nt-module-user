import { Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { ResourceService } from '../services/resource.service';

@Resolver()
@Resource({ name: 'resource_manage', identify: 'resource:manage' })
export class ResourceResolver {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @Query('findResources')
    @Permission({ name: 'find_resources', identify: 'resource:findResources', action: 'find' })
    async findResources(req, body): Promise<CommonResult> {
        const data = await this.resourceService.findResources();
        return { code: 200, message: t('Query the resource successfully'), data };
    }
}