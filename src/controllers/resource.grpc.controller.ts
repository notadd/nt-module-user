import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { ResourceService } from '../services/resource.service';

@Controller()
export class ResourceGrpcController {

    constructor(
        @Inject(ResourceService) private readonly resourceService: ResourceService
    ) { }

    @GrpcMethod('ResourceService')
    async saveResourcesAndPermissions(payload: { metadata: string }) {
        await this.resourceService.saveResourcesAndPermissions(payload.metadata);
        return { code: 200, message: 'success', data: '' };
    }

    @GrpcMethod('ResourceService')
    async findResources(payload: { systemModuleId: number }) {
        const data = await this.resourceService.findResources(payload.systemModuleId);
        return { code: 200, message: t('Query the resource successfully'), data };
    }
}