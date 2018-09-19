import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SystemModule } from '../entities/system-module.entity';

@Injectable()
export class SystemModuleService {
    constructor(
        @InjectRepository(SystemModule) private readonly systemModuleRepo: Repository<SystemModule>
    ) { }

    async findSystemModules() {
        return this.systemModuleRepo.find();
    }
}