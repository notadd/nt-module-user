import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectEntityManager } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { EntityManager } from 'typeorm';

@Injectable()
export class EntityCheckService {
    constructor(
        @InjectEntityManager() private entityManager: EntityManager
    ) { }

    async checkNameExist(entityClass: any, name: string) {
        const exist = await this.entityManager.findOne(entityClass, { name });
        if (exist) {
            throw new RpcException({ code: 409, message: t('Name already exists') });
        }
    }
}