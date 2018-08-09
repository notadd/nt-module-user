import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceService {
    constructor(
        @InjectRepository(Resource) private readonly resourceRep: Repository<Resource>
    ) { }

    async findResources() {
        return this.resourceRep.find({ relations: ['permissions'] });
    }
}