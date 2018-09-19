import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { SystemModuleService } from '../services/system-module.service';

@Resolver()
@Resource({ name: 'system_module_manage', identify: 'systemModule:manage' })
export class SystemModuleResolver {
    constructor(
        @Inject(SystemModuleService) private readonly systemModuleService: SystemModuleService
    ) { }

    @Query('findSystemModules')
    @Permission({ name: 'find_system_modules', identify: 'systemModule:findSystemModules', action: 'find' })
    async findSystemModules(): Promise<CommonResult> {
        const data = await this.systemModuleService.findSystemModules();
        return { code: 200, message: t('Query the system modules successfully'), data };
    }
}