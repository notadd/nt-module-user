import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InfoGroup } from '../entities/info-group.entity';
import { InfoItem } from '../entities/info-item.entity';


@Injectable()
export class InfoGroupService {
    constructor(
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>
    ) { }

    /**
     * 创建信息组
     *
     * @param infoGroup 信息组信息
     */
    async create(name: string, roleId: number) {
        this.infoGroupRepo.save(this.infoGroupRepo.create({ name, role: { id: roleId } }));
    }

    /**
     * 向指定信息组添加指定信息项
     *
     * @param infoGroupId 信息组ID
     * @param infoItemIds 信息项ID
     */
    async addInfoItem(infoGroupId: number, infoItemIds: number[]) {
        const infoItems = await this.infoGroupRepo
            .createQueryBuilder('infoGroup')
            .relation(InfoGroup, 'infoItems')
            .of(infoGroupId)
            .loadMany<InfoItem>();

        const duplicateIds = infoItems.map(infoItem => infoItem.id).filter(infoItemId => infoItemIds.includes(infoItemId));
        if (duplicateIds) throw new HttpException(`信息项 ID: ${duplicateIds} 已存在`, 409);

        this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(infoGroupId).add(infoItemIds);
    }

    /**
     * 删除信息组
     *
     * @param id 信息组ID
     */
    async delete(id: number) {
        this.infoGroupRepo.delete(id);
    }

    /**
     * 移除指定信息组的指定信息项
     *
     * @param infoGroupId 信息组ID
     * @param infoItemIds 信息项ID
     */
    async deleteIntoItem(infoGroupId: number, infoItemIds: number[]) {
        this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(infoGroupId).remove(infoItemIds);
    }

    /**
     * 更新信息组
     *
     * @param id 信息组ID
     * @param name 信息组名称
     */
    async update(id: number, name: string, roleId: number) {
        this.infoGroupRepo.update(id, { name, role: { id: roleId } });
    }

    /**
     * 查询所有信息组
     */
    async findAll() {
        return this.infoGroupRepo.find();
    }

    /**
     * 查询当前信息组ID下的所有信息项
     *
     * @param id 信息组ID
     */
    async findItemsById(id: number) {
        return this.infoGroupRepo.createQueryBuilder('infoGroup').relation(InfoGroup, 'infoItems').of(id).loadMany();
    }
}