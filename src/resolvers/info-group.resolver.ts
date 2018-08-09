import { Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { InfoGroup } from '../entities/info-group.entity';
import { CommonResult } from '../interfaces/common-result.interface';
import { InfoGroupService } from '../services/info-group.service';

@Resolver()
export class InfoGroupResolver {
    constructor(
        @Inject(InfoGroupService) private readonly infoGroupService: InfoGroupService
    ) { }

    @Mutation('createInfoGroup')
    async createInfoGroup(req, body: { infoGroup: InfoGroup }): Promise<CommonResult> {
        await this.infoGroupService.create(body.infoGroup);
        return { code: 200, message: '添加信息组成功' };
    }

    @Mutation('deleteInfoGroup')
    async deleteInfoGroup(req, body: { groupId: number }): Promise<CommonResult> {
        await this.infoGroupService.delete(body.groupId);
        return { code: 200, message: '删除信息组成功' };
    }

    @Mutation('updateInfoGroup')
    async updateInfoGroup(req, body: { groupId: number, name: string }): Promise<CommonResult> {
        await this.infoGroupService.update(body.groupId, body.name);
        return { code: 200, message: '更新信息组成功' };
    }

    @Query('findAllInfoGroup')
    async findAllInfoGroup(): Promise<CommonResult> {
        const infoGroups = await this.infoGroupService.findAll();
        return { code: 200, message: '查询所有信息组成功', data: infoGroups };
    }

    @Query('findInfoItemsByGroupId')
    async findInfoItemsByGroupId(req, body: { groupId: number }): Promise<CommonResult> {
        const infoItems = await this.infoGroupService.findItemsById(body.groupId);
        return { code: 200, message: '查询信息项成功', data: infoItems };
    }
}