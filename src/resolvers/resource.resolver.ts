import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { AuthorizationGurad } from '../auth/authorization.gurad';
import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { ResourceService } from '../services/resource.service';

@Resolver()
@UseGuards(AuthorizationGurad)
@Resource({ name: '资源管理', identify: 'resource:manage' })
export class ResourceResolver {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    @Query('findResources')
    @Permission({ name: '查询资源', identify: 'resource:findResources', action: 'find' })
    async findResources(req, body): Promise<CommonResult> {
        const data = await this.resourceService.findResources();
        return { code: 200, message: '获取成功', data };
    }
}