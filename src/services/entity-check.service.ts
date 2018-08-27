import { HttpException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class EntityCheckService {
    constructor(
        @InjectEntityManager() private entityManager: EntityManager
    ) { }

    async checkNameExist(entityClass: any, name: string) {
        const exist = await this.entityManager.findOne(entityClass, { name });
        if (exist) {
            throw new HttpException('名称已存在', 409);
        }
    }
}