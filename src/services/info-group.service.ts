import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { Repository } from 'typeorm';

import { InfoGroup } from '../entities/info-group.entity';
import { InfoItem } from '../entities/info-item.entity';
import { EntityCheckService } from './entity-check.service';

@Injectable()
export class InfoGroupService {
    constructor(
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>,
        @Inject(EntityCheckService) private readonly entityCheckService: EntityCheckService
    ) { }

    /**
     * Create a information group
     *
     * @param name The name of information group
     * @param roleId The roleId of information group
     */
    async create(name: string, roleId: number) {
        await this.entityCheckService.checkNameExist(InfoGroup, name);
        if (await this.infoGroupRepo.findOne({ role: { id: roleId } })) {
            throw new HttpException(t('The role information group already exists'), 409);
        }
        await this.infoGroupRepo.save(this.infoGroupRepo.create({ name, role: { id: roleId } }));
    }

    /**
     * Add some specified information items to the specified information group
     *
     * @param infoGroupId The specified information group's id
     * @param infoItemIds The specified information item's id array
     */
    async addInfoItem(infoGroupId: number, infoItemIds: number[]) {
        const infoItems = await this.infoGroupRepo
            .createQueryBuilder('infoGroup')
            .relation(InfoGroup, 'infoItems')
            .of(infoGroupId)
            .loadMany<InfoItem>();

        const duplicateIds = infoItems.map(infoItem => infoItem.id).filter(infoItemId => infoItemIds.includes(infoItemId));
        if (duplicateIds.length) throw new HttpException(t('Information item with id [%s] already exists', duplicateIds.toString()), 409);

        await this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(infoGroupId).add(infoItemIds);
    }

    /**
     * Delete the specified information group
     *
     * @param id The information group's id
     */
    async delete(id: number) {
        await this.infoGroupRepo.delete(id);
    }

    /**
     * Remove specified information items from the specified information group
     *
     * @param infoGroupId The specified information group's id
     * @param infoItemIds The specified information item's id array
     */
    async deleteIntoItem(infoGroupId: number, infoItemIds: number[]) {
        await this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(infoGroupId).remove(infoItemIds);
    }

    /**
     * Update the specified information group
     *
     * @param id The specified information group's id
     * @param name The name to be update
     */
    async update(id: number, name: string, roleId: number) {
        await this.entityCheckService.checkNameExist(InfoGroup, name);
        await this.infoGroupRepo.update(id, { name, role: { id: roleId } });
    }

    /**
     * Query all groups
     */
    async findAll(pageNumber?: number, pageSize?: number) {
        if (pageNumber && pageSize) {
            return this.infoGroupRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
        }
        return this.infoGroupRepo.find();
    }

    /**
     * Query all information items under the current information group ID
     *
     * @param id The specified information group's id
     */
    async findItemsById(id: number) {
        return this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(id).loadMany();
    }
}