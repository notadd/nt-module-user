import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceService {
    constructor(
        @InjectRepository(Resource) private readonly resourceRep: Repository<Resource>
    ) { }

    async findResources(moduleId: number) {
        return this.resourceRep.find({ where: { systemModule: { id: moduleId } }, relations: ['permissions'] });
    }
}