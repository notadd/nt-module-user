import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { SystemModuleService } from '../services/system-module.service';

@Controller()
export class SystemModuleGrpcController {
    constructor(
        @Inject(SystemModuleService) private readonly systemModuleService: SystemModuleService
    ) { }

    @GrpcMethod('SystemModuleService')
    async findSystemModules() {
        const data = await this.systemModuleService.findSystemModules();
        return { code: 200, message: t('Query the resource successfully'), data };
    }
}