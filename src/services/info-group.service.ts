import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InfoGroup } from '../entities/info.group.entity';

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
    async create(infoGroup: InfoGroup) {
        this.infoGroupRepo.save(this.infoGroupRepo.create(infoGroup));
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
     * 更新信息组
     *
     * @param id 信息组ID
     * @param name 信息组名称
     */
    async update(id: number, name: string) {
        this.infoGroupRepo.update(id, { name });
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
        return this.infoGroupRepo.find({ where: { id }, relations: ['infoItem'] });
    }
}