import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { InfoGroupService } from '../services/info-group.service';

@Resolver()
@Resource({ name: '信息组管理', identify: 'infoGroup:manage' })
export class InfoGroupResolver {
    constructor(
        @Inject(InfoGroupService) private readonly infoGroupService: InfoGroupService
    ) { }

    @Mutation('createInfoGroup')
    @Permission({ name: '创建信息组', identify: 'infoGroup:createInfoGroup', action: 'create' })
    async createInfoGroup(req, body: { name: string, roleId: number }): Promise<CommonResult> {
        await this.infoGroupService.create(body.name, body.roleId);
        return { code: 200, message: '创建信息组成功' };
    }

    @Mutation('deleteInfoGroup')
    @Permission({ name: '删除信息组', identify: 'infoGroup:deleteInfoGroup', action: 'delete' })
    async deleteInfoGroup(req, body: { groupId: number }): Promise<CommonResult> {
        await this.infoGroupService.delete(body.groupId);
        return { code: 200, message: '删除信息组成功' };
    }

    @Mutation('updateInfoGroup')
    @Permission({ name: '更新信息组', identify: 'infoGroup:updateInfoGroup', action: 'update' })
    async updateInfoGroup(req, body: { groupId: number, name: string, roleId: number }): Promise<CommonResult> {
        await this.infoGroupService.update(body.groupId, body.name, body.roleId);
        return { code: 200, message: '更新信息组成功' };
    }

    @Mutation('addInfoItemToInfoGroup')
    @Permission({ name: '向信息组添加信息项', identify: 'infoGroup:addInfoItemToInfoGroup', action: 'create' })
    async addInfoItemToInfoGroup(req, body: { infoGroupId: number, infoItemIds: number[] }): Promise<CommonResult> {
        await this.infoGroupService.addInfoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: '添加信息项成功' };
    }

    @Mutation('deleteIntoItemFromInfoGroup')
    @Permission({ name: '删除信息组中的信息项', identify: 'infoGroup:deleteIntoItemFromInfoGroup', action: 'delete' })
    async deleteIntoItemFromInfoGroup(req, body: { infoGroupId: number, infoItemIds: number[] }): Promise<CommonResult> {
        await this.infoGroupService.deleteIntoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: '删除信息项成功' };
    }

    @Query('findAllInfoGroup')
    @Permission({ name: '查询所有信息组', identify: 'infoGroup:findAllInfoGroup', action: 'find' })
    async findAllInfoGroup(): Promise<CommonResult> {
        const infoGroups = await this.infoGroupService.findAll();
        return { code: 200, message: '查询所有信息组成功', data: infoGroups };
    }

    @Query('findInfoItemsByGroupId')
    @Permission({ name: '查询信息组中的信息项', identify: 'infoGroup:findInfoItemsByGroupId', action: 'find' })
    async findInfoItemsByGroupId(req, body: { groupId: number }): Promise<CommonResult> {
        const infoItems = await this.infoGroupService.findItemsById(body.groupId);
        return { code: 200, message: '查询信息项成功', data: infoItems };
    }
}