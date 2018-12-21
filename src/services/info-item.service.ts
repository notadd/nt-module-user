import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { Repository } from 'typeorm';

import { InfoItem } from '../entities/info-item.entity';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { EntityCheckService } from './entity-check.service';

@Injectable()
export class InfoItemService {
    constructor(
        @InjectRepository(InfoItem) private readonly infoItemRepo: Repository<InfoItem>,
        @Inject(EntityCheckService) private readonly entityCheckService: EntityCheckService
    ) { }

    /**
     * Create an item of information
     *
     * @param infoItem The information item object
     */
    async create(infoItem: InfoItem) {
        await this.entityCheckService.checkNameExist(InfoItem, infoItem.name);
        await this.infoItemRepo.save(this.infoItemRepo.create(infoItem));
    }

    /**
     * Delete information item
     *
     * @param id The information item's id
     */
    async delete(id: number) {
        const infoItem = await this.infoItemRepo.findOne(id, { relations: ['userInfos', 'infoGroups'] });
        if (!infoItem) throw new RpcException({ code: 404, message: t('Information item with id [%s] does not exists', id.toString()) });
        await this.infoItemRepo.createQueryBuilder('infoItem').relation(InfoItem, 'infoGroups').of(id).remove(infoItem.infoGroups.map(v => v.id));
        await this.infoItemRepo.remove(infoItem);
    }

    /**
     * Update the specified information
     *
     * @param id The information item's id
     * @param name The information item's name
     * @param description The information item's description
     * @param type The information item's type
     */
    async update(updateInfoItemInput: UpdateInfoItemInput) {
        await this.entityCheckService.checkNameExist(InfoItem, updateInfoItemInput.name);
        if (updateInfoItemInput.order) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { order: updateInfoItemInput.order });
        }
        if (updateInfoItemInput.type) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { type: updateInfoItemInput.type });
        }
        if (updateInfoItemInput.name) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { name: updateInfoItemInput.name });
        }
        if (updateInfoItemInput.description) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { description: updateInfoItemInput.description });
        }
        if (updateInfoItemInput.registerDisplay) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { registerDisplay: updateInfoItemInput.registerDisplay });
        }
        if (updateInfoItemInput.informationDisplay) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { informationDisplay: updateInfoItemInput.informationDisplay });
        }
    }

    /**
     * Query all information items
     */
    async findAll(pageNumber?: number, pageSize?: number) {
        if (pageNumber && pageSize) {
            return this.infoItemRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize, order: { order: 'ASC' } });
        }
        return this.infoItemRepo.find({ order: { order: 'ASC' } });
    }
}