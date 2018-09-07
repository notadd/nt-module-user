import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { InfoGroupService } from '../services/info-group.service';

@Resolver()
@Resource({ name: 'info_group_manage', identify: 'infoGroup:manage' })
export class InfoGroupResolver {
    constructor(
        @Inject(InfoGroupService) private readonly infoGroupService: InfoGroupService
    ) { }

    @Mutation('createInfoGroup')
    @Permission({ name: 'create_info_group', identify: 'infoGroup:createInfoGroup', action: 'create' })
    async createInfoGroup(req, body: { name: string, roleId: number }): Promise<CommonResult> {
        await this.infoGroupService.create(body.name, body.roleId);
        return { code: 200, message: t('Create a information group successfully') };
    }

    @Mutation('deleteInfoGroup')
    @Permission({ name: 'delete_info_group', identify: 'infoGroup:deleteInfoGroup', action: 'delete' })
    async deleteInfoGroup(req, body: { groupId: number }): Promise<CommonResult> {
        await this.infoGroupService.delete(body.groupId);
        return { code: 200, message: t('Deleted the information group successfully') };
    }

    @Mutation('updateInfoGroup')
    @Permission({ name: 'update_info_group', identify: 'infoGroup:updateInfoGroup', action: 'update' })
    async updateInfoGroup(req, body: { groupId: number, name: string, roleId: number }): Promise<CommonResult> {
        await this.infoGroupService.update(body.groupId, body.name, body.roleId);
        return { code: 200, message: t('Update the information group successfully') };
    }

    @Mutation('addInfoItemToInfoGroup')
    @Permission({ name: 'add_info_item_to_info_group', identify: 'infoGroup:addInfoItemToInfoGroup', action: 'create' })
    async addInfoItemToInfoGroup(req, body: { infoGroupId: number, infoItemIds: number[] }): Promise<CommonResult> {
        await this.infoGroupService.addInfoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: t('Add an information item to the information group successfully') };
    }

    @Mutation('deleteIntoItemFromInfoGroup')
    @Permission({ name: 'delete_into_item_from_info_group', identify: 'infoGroup:deleteIntoItemFromInfoGroup', action: 'delete' })
    async deleteIntoItemFromInfoGroup(req, body: { infoGroupId: number, infoItemIds: number[] }): Promise<CommonResult> {
        await this.infoGroupService.deleteIntoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: t('Delete the information item in the information group successfully') };
    }

    @Query('findAllInfoGroup')
    @Permission({ name: 'find_all_info_group', identify: 'infoGroup:findAllInfoGroup', action: 'find' })
    async findAllInfoGroup(): Promise<CommonResult> {
        const data = await this.infoGroupService.findAll();
        return { code: 200, message: t('Query all information groups successfully'), data };
    }

    @Query('findInfoItemsByGroupId')
    @Permission({ name: 'find_info_items_by_group_id', identify: 'infoGroup:findInfoItemsByGroupId', action: 'find' })
    async findInfoItemsByGroupId(req, body: { groupId: number }): Promise<CommonResult> {
        const data = await this.infoGroupService.findItemsById(body.groupId);
        return { code: 200, message: t('Query the information item in the information group successfully'), data };
    }
}