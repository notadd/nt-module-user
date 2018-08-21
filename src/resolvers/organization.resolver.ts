import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { Permission, Resource } from '../decorators';
import { OrganizationService } from './../services/organization.service';

@Resolver()
@Resource({ name: '组织管理', identify: 'organization:manage' })
export class OrganizationResolver {
    constructor(
        private readonly organizationService: OrganizationService
    ) { }

    @Query('findRootOrganizations')
    @Permission({ name: '查询根组织', identify: 'organization:findRootOrganizations', action: 'find' })
    async findRootOrganizations() {
        const roots = await this.organizationService.findRoots();
        return { code: 200, message: '获取根组织成功', data: roots };
    }

    @Query('findAllOrganizations')
    @Permission({ name: '查询所有组织', identify: 'organization:findAllOrganizations', action: 'find' })
    async findAllOrganizations() {
        const organizationArr = await this.organizationService.findAllTrees();
        // 由于graphql不支持递归，需要把数据转换成JSON字符串
        return { code: 200, message: '获取所有组织成功', data: JSON.stringify(organizationArr) };
    }

    @Query('findChildrenOrganizations')
    @Permission({ name: '查询组织下的子组织', identify: 'organization:findChildrenOrganizations', action: 'find' })
    async findChildrenOrganizations(req, body: { id: number }) {
        const { id } = body;
        const organization = await this.organizationService.findChildren(id);
        return { code: 200, message: '获取组织下面的所有子组织成功', data: JSON.stringify(organization) };
    }

    @Query('findUserInOrganization')
    @Permission({ name: '查询组织下的子组织', identify: 'organization:findUserInOrganization', action: 'find' })
    async findUserInOrganization(req, body: { id: number }) {
        const { id } = body;
        const userArr = await this.organizationService.findUserInOrganization(id);
        return { code: 200, message: '获取成功', data: userArr };
    }

    @Mutation('createOrganization')
    @Permission({ name: '创建组织', identify: 'organization:createOrganization', action: 'create' })
    async createOrganization(req, body: { name: string, parentId: number }) {
        const { name, parentId } = body;
        await this.organizationService.createOrganization(name, parentId);
        return { code: 200, message: '创建组织成功' };
    }

    @Mutation('updateOrganization')
    @Permission({ name: '更新组织', identify: 'organization:updateOrganization', action: 'update' })
    async updateOrganization(req, body: { id: number, name: string, parentId: number }) {
        const { id, name, parentId } = body;
        await this.organizationService.updateOrganization(id, name, parentId);
        return { code: 200, message: '更新组织成功' };
    }

    @Mutation('deleteOrganization')
    @Permission({ name: '删除组织', identify: 'organization:deleteOrganization', action: 'delete' })
    async deleteOrganization(req, body: { id: number }) {
        const { id } = body;
        await this.organizationService.deleteOrganization(id);
        return { code: 200, message: '删除组织成功' };
    }

    @Mutation('addUsersToOrganization')
    @Permission({ name: '向组织添加用户', identify: 'organization:addUsersToOrganization', action: 'create' })
    async addUsersToOrganization(req, body: { id: number, userIds: number[] }) {
        const { id, userIds } = body;
        await this.organizationService.addUsersToOrganization(id, userIds);
        return { code: 200, message: '添加用户成功' };
    }

    @Mutation('deleteUserFromOrganization')
    @Permission({ name: '删除组织中的用户', identify: 'organization:deleteUserFromOrganization', action: 'delete' })
    async deleteUserFromOrganization(req, body: { id: number, userIds: number[] }) {
        const { id, userIds } = body;
        await this.organizationService.deleteUserFromOrganization(id, userIds);
        return { code: 200, message: '删除用户成功' };
    }
}