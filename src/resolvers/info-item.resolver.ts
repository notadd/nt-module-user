import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { Permission, Resource } from '../decorators';
import { InfoItem } from '../entities/info-item.entity';
import { CommonResult } from '../interfaces/common-result.interface';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { InfoItemService } from '../services/info-item.service';

@Resolver()
@Resource({ name: '信息项管理', identify: 'infoItem:manage' })
export class InfoItemResolver {
    constructor(
        @Inject(InfoItemService) private readonly infoItemService: InfoItemService
    ) { }

    @Mutation('createInfoItem')
    @Permission({ name: '创建信息项', identify: 'infoItem:createInfoItem', action: 'create' })
    async createInfoItem(req, body: { infoItemInput: InfoItem }): Promise<CommonResult> {
        await this.infoItemService.create(body.infoItemInput);
        return { code: 200, message: '创建信息项成功' };
    }

    @Mutation('deleteInfoItem')
    @Permission({ name: '删除信息项', identify: 'infoItem:deleteInfoItem', action: 'delete' })
    async deleteInfoItem(req, body: { infoItemId: number }): Promise<CommonResult> {
        await this.infoItemService.delete(body.infoItemId);
        return { code: 200, message: '删除信息项成功' };
    }

    @Mutation('updateInfoItem')
    @Permission({ name: '更新信息项', identify: 'infoItem:updateInfoItem', action: 'update' })
    async updateInfoItem(req, body: { updateInfoItemInput: UpdateInfoItemInput }): Promise<CommonResult> {
        await this.infoItemService.update(body.updateInfoItemInput);
        return { code: 200, message: '更新信息项成功' };
    }

    @Query('findAllInfoItem')
    @Permission({ name: '查所有信息项', identify: 'infoItem:findAllInfoItem', action: 'find' })
    async findAllInfoItem(): Promise<CommonResult> {
        const data = await this.infoItemService.findAll();
        return { code: 200, message: '查所有信息项成功', data };
    }
}