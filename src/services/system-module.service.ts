import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SystemModule } from '../entities/system-module.entity';

@Injectable()
export class SystemModuleService {
    constructor(
        @InjectRepository(SystemModule) private readonly systemModuleRepo: Repository<SystemModule>
    ) { }

    async findSystemModules(pageNumber?: number, pageSize?: number) {
        if (pageNumber && pageSize) {
            return this.systemModuleRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
        }
        return this.systemModuleRepo.find();
    }
}