import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { InfoItem } from '../entities/info-item.entity';
import { CommonResult } from '../interfaces/common-result.interface';
import { InfoItemService } from '../services/info-item.service';

@Resolver()
export class InfoItemResolver {
    constructor(
        @Inject(InfoItemService) private readonly infoItemService: InfoItemService
    ) { }

    @Mutation('createInfoItem')
    async createInfoItem(req, body: { infoItem: InfoItem }): Promise<CommonResult> {
        await this.infoItemService.create(body.infoItem);
        return { code: 200, message: '创建信息项成功' };
    }

    @Mutation('deleteInfoItem')
    async deleteInfoItem(req, body: { infoItemId: number }): Promise<CommonResult> {
        await this.infoItemService.delete(body.infoItemId);
        return { code: 200, message: '删除信息项成功' };
    }

    @Mutation('updateInfoItem')
    async updateInfoItem(req, body: { infoItemId: number, name: string, label: string, description: string, type: string }): Promise<CommonResult> {
        const { infoItemId, name, label, description, type } = body;
        await this.infoItemService.update(infoItemId, name, label, description, type);
        return { code: 200, message: '更新信息项成功' };
    }

    @Query('findAllInfoItem')
    async findAllInfoItem(): Promise<CommonResult> {
        const infoItems = await this.infoItemService.findAll();
        return { code: 200, message: '查所有信息项成功', data: infoItems };
    }
}