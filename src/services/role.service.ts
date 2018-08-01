import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
    constructor (
        @InjectRepository(Role) private readonly roleRep: Repository<Role>
    ) {}
}