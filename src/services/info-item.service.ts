import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
     * 创建信息项
     *
     * @param infoItem 信息项信息
     */
    async create(infoItem: InfoItem) {
        await this.entityCheckService.checkNameExist(InfoItem, infoItem.name);
        this.infoItemRepo.save(this.infoItemRepo.create(infoItem));
    }

    /**
     * 删除信息项
     *
     * @param id 信息项ID
     */
    async delete(id: number) {
        const infoItem = await this.infoItemRepo.findOne(id, { relations: ['userInfos', 'infoGroups'] });
        this.infoItemRepo.createQueryBuilder('infoItem').relation(InfoItem, 'infoGroups').of(id).remove(infoItem.infoGroups);
        this.infoItemRepo.remove(infoItem);
    }

    /**
     * 更新信息项的指定信息
     *
     * @param id 信息项ID
     * @param name 信息项名称
     * @param description 信息项描述
     * @param type 信息项类型
     */
    async update(updateInfoItemInput: UpdateInfoItemInput) {
        await this.entityCheckService.checkNameExist(InfoItem, updateInfoItemInput.name);
        if (updateInfoItemInput.order) {
            this.infoItemRepo.update(updateInfoItemInput.id, { order: updateInfoItemInput.order });
        }
        if (updateInfoItemInput.type) {
            this.infoItemRepo.update(updateInfoItemInput.id, { type: updateInfoItemInput.type });
        }
        if (updateInfoItemInput.name) {
            this.infoItemRepo.update(updateInfoItemInput.id, { name: updateInfoItemInput.name });
        }
        if (updateInfoItemInput.description) {
            this.infoItemRepo.update(updateInfoItemInput.id, { description: updateInfoItemInput.description });
        }
        if (updateInfoItemInput.registerDisplay) {
            this.infoItemRepo.update(updateInfoItemInput.id, { registerDisplay: updateInfoItemInput.registerDisplay });
        }
        if (updateInfoItemInput.informationDisplay) {
            this.infoItemRepo.update(updateInfoItemInput.id, { informationDisplay: updateInfoItemInput.informationDisplay });
        }
    }

    /**
     * 查询所有信息项
     */
    async findAll() {
        return this.infoItemRepo.find({ order: { order: 'ASC' } });
    }
}