import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { SystemModule } from '../entities/system-module.entity';
import { SystemModuleService } from '../services/system-module.service';

@Controller()
export class SystemModuleGrpcController {
    constructor(
        @Inject(SystemModuleService) private readonly systemModuleService: SystemModuleService
    ) { }

    @GrpcMethod('SystemModuleService')
    async findSystemModules(payload: { pageNumber: number, pageSize: number }) {
        const result = await this.systemModuleService.findSystemModules(payload.pageNumber, payload.pageSize);
        let data: SystemModule[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [SystemModule[], number])[0];
            count = (result as [SystemModule[], number])[1];
        } else {
            data = result as SystemModule[];
        }
        return { code: 200, message: t('Query the resource successfully'), data, count };
    }
}