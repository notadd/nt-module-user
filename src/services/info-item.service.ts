import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InfoItem } from '../entities/info-item.entity';

@Injectable()
export class InfoItemService {
    constructor(
        @InjectRepository(InfoItem) private readonly infoItemRepo: Repository<InfoItem>
    ) { }

    /**
     * 创建信息项
     *
     * @param infoItem 信息项信息
     */
    async create(infoItem: InfoItem) {
        this.infoItemRepo.save(this.infoItemRepo.create(infoItem));
    }

    /**
     * 删除信息项
     *
     * @param id 信息项ID
     */
    async delete(id: number) {
        const infoItem = await this.infoItemRepo.findOne(id, { relations: ['userInfo', 'infoGroups'] });
        this.infoItemRepo.createQueryBuilder('infoItem').relation(InfoItem, 'infoGroups').of(id).remove(infoItem.infoGroups);
        this.infoItemRepo.remove(infoItem);
    }

    /**
     * 更新信息项的指定信息
     *
     * @param id 信息项ID
     * @param name 信息项名称
     * @param label 信息项标签
     * @param description 信息项描述
     * @param type 信息项类型
     */
    async update(id: number, name: string, label: string, description: string, type: string) {
        const nameExist = await this.infoItemRepo.findOne({ where: { name } });
        if (nameExist) {
            throw new HttpException(`信息项名称：${name} 已存在`, 409);
        }
        this.infoItemRepo.update(id, { name, label, description, type });
    }

    /**
     * 查询所有信息项
     */
    async findAll() {
        return this.infoItemRepo.find();
    }
}