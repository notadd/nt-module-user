import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { Resource } from '../entities/resource.entity';
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
    async findResources(payload: { systemModuleId: number, pageNumber: number, pageSize: number }) {
        const { systemModuleId, pageNumber, pageSize } = payload;
        const result = await this.resourceService.findResources(systemModuleId, pageNumber, pageSize);
        let data: Resource[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [Resource[], number])[0];
            count = (result as [Resource[], number])[1];
        } else {
            data = result as Resource[];
        }
        return { code: 200, message: t('Query the resource successfully'), data, count };
    }
}