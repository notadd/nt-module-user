import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { SystemModule } from '../entities/system-module.entity';
import { SystemModuleService } from '../services/system-module.service';

@Resolver()
@Resource({ name: 'system_module_manage', identify: 'systemModule:manage' })
export class SystemModuleResolver {
    constructor(
        @Inject(SystemModuleService) private readonly systemModuleService: SystemModuleService
    ) { }

    @Query('findSystemModules')
    @Permission({ name: 'find_system_modules', identify: 'systemModule:findSystemModules', action: 'find' })
    async findSystemModules(req, body: { pageNumber: number, pageSize: number }) {
        const result = await this.systemModuleService.findSystemModules(body.pageNumber, body.pageSize);
        let data: SystemModule[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [SystemModule[], number])[0];
            count = (result as [SystemModule[], number])[1];
        } else {
            data = result as SystemModule[];
        }
        return { code: 200, message: t('Query the system modules successfully'), data, count };
    }
}