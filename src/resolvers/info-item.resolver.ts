import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { InfoItem } from '../entities/info-item.entity';
import { CommonResult } from '../interfaces/common-result.interface';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { InfoItemService } from '../services/info-item.service';

@Resolver()
@Resource({ name: 'info_item_manage', identify: 'infoItem:manage' })
export class InfoItemResolver {
    constructor(
        @Inject(InfoItemService) private readonly infoItemService: InfoItemService
    ) { }

    @Mutation('createInfoItem')
    @Permission({ name: 'create_info_item', identify: 'infoItem:createInfoItem', action: 'create' })
    async createInfoItem(req, body: { infoItemInput: InfoItem }): Promise<CommonResult> {
        await this.infoItemService.create(body.infoItemInput);
        return { code: 200, message: t('Create information item successfully') };
    }

    @Mutation('deleteInfoItem')
    @Permission({ name: 'delete_info_item', identify: 'infoItem:deleteInfoItem', action: 'delete' })
    async deleteInfoItem(req, body: { infoItemId: number }): Promise<CommonResult> {
        await this.infoItemService.delete(body.infoItemId);
        return { code: 200, message: t('Delete information item successfully') };
    }

    @Mutation('updateInfoItem')
    @Permission({ name: 'update_info_item', identify: 'infoItem:updateInfoItem', action: 'update' })
    async updateInfoItem(req, body: { updateInfoItemInput: UpdateInfoItemInput }): Promise<CommonResult> {
        await this.infoItemService.update(body.updateInfoItemInput);
        return { code: 200, message: t('Update information item successfully') };
    }

    @Query('findAllInfoItem')
    @Permission({ name: 'find_all_info_item', identify: 'infoItem:findAllInfoItem', action: 'find' })
    async findAllInfoItem(req, body: { pageNumber: number, pageSize: number }) {
        const result = await this.infoItemService.findAll(body.pageNumber, body.pageSize);
        let data: InfoItem[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [InfoItem[], number])[0];
            count = (result as [InfoItem[], number])[1];
        } else {
            data = result as InfoItem[];
        }
        return { code: 200, message: t('Query all information items successfully'), data, count };
    }
}