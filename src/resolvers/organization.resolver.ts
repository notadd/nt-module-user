import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthorizationGurad } from '../auth/authorization.gurad';
import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { OrganizationService } from './../services/organization.service';

@Resolver()
@UseGuards(AuthorizationGurad)
@Resource({ name: '组织管理', identify: 'organization:manage' })
export class OrganizationResolver {
    constructor(
        private readonly organizationService: OrganizationService
    ) { }

    @Query('findRootOrganizations')
    @Permission({ name: '查询根组织', identify: 'organization:findRootOrganizations', action: 'find' })
    async findRootOrganizations(): Promise<CommonResult> {
        const data = await this.organizationService.findRoots();
        return { code: 200, message: '获取根组织成功', data };
    }

    @Query('findAllOrganizations')
    @Permission({ name: '查询所有组织', identify: 'organization:findAllOrganizations', action: 'find' })
    async findAllOrganizations(): Promise<CommonResult> {
        const data = await this.organizationService.findAllTrees();
        return { code: 200, message: '获取所有组织成功', data };
    }

    @Query('findChildrenOrganizations')
    @Permission({ name: '查询组织下的子组织', identify: 'organization:findChildrenOrganizations', action: 'find' })
    async findChildrenOrganizations(req, body: { id: number }): Promise<CommonResult> {
        const data = await this.organizationService.findChildren(body.id);
        return { code: 200, message: '获取组织下面的所有子组织成功', data };
    }

    @Mutation('createOrganization')
    @Permission({ name: '创建组织', identify: 'organization:createOrganization', action: 'create' })
    async createOrganization(req, body: { name: string, parentId: number }): Promise<CommonResult> {
        await this.organizationService.createOrganization(body.name, body.parentId);
        return { code: 200, message: '创建组织成功' };
    }

    @Mutation('updateOrganization')
    @Permission({ name: '更新组织', identify: 'organization:updateOrganization', action: 'update' })
    async updateOrganization(req, body: { id: number, name: string, parentId: number }): Promise<CommonResult> {
        await this.organizationService.updateOrganization(body.id, body.name, body.parentId);
        return { code: 200, message: '更新组织成功' };
    }

    @Mutation('deleteOrganization')
    @Permission({ name: '删除组织', identify: 'organization:deleteOrganization', action: 'delete' })
    async deleteOrganization(req, body: { id: number }): Promise<CommonResult> {
        await this.organizationService.deleteOrganization(body.id);
        return { code: 200, message: '删除组织成功' };
    }

    @Mutation('addUsersToOrganization')
    @Permission({ name: '向组织添加用户', identify: 'organization:addUsersToOrganization', action: 'create' })
    async addUsersToOrganization(req, body: { id: number, userIds: number[] }): Promise<CommonResult> {
        await this.organizationService.addUsersToOrganization(body.id, body.userIds);
        return { code: 200, message: '添加用户成功' };
    }

    @Mutation('deleteUserFromOrganization')
    @Permission({ name: '删除组织中的用户', identify: 'organization:deleteUserFromOrganization', action: 'delete' })
    async deleteUserFromOrganization(req, body: { id: number, userIds: number[] }): Promise<CommonResult> {
        await this.organizationService.deleteUserFromOrganization(body.id, body.userIds);
        return { code: 200, message: '删除用户成功' };
    }
}