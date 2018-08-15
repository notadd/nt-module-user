import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { OrganizationService } from './../services/organization.service';

@Resolver()
export class OrganizationResolver {
    constructor(
        private readonly organizationService: OrganizationService
    ) { }

    @Query('findRootOrganizations')
    async findRootOrganizations() {
        const roots = await this.organizationService.findRoots();
        return { code: 200, message: '获取根组织成功', data: roots };
    }

    @Query('findAllOrganizations')
    async findAllOrganizations() {
        const organizationArr = await this.organizationService.findAllTrees();
        // 由于graphql不支持递归，需要把数据转换成JSON字符串
        return { code: 200, message: '获取所有组织成功', data: JSON.stringify(organizationArr) };
    }

    @Query('findChildrenOrganizations')
    async findChildrenOrganizations(req, body: { id: number }) {
        const { id } = body;
        const organization = await this.organizationService.findChildren(id);
        return { code: 200, message: '获取组织下面的所有子组织成功', data: JSON.stringify(organization) };
    }

    @Query('findUserInOrganization')
    async findUserInOrganization(req, body: { id: number }) {
        const { id } = body;
        const userArr = await this.organizationService.findUserInOrganization(id);
        return { code: 200, message: '获取成功', data: userArr };
    }

    @Mutation('createOrganization')
    async createOrganization(req, body: { name: string, parentId: number }) {
        const { name, parentId } = body;
        await this.organizationService.createOrganization(name, parentId);
        return { code: 200, message: '创建组织成功' };
    }

    @Mutation('updateOrganization')
    async updateOrganization(req, body: { id: number, name: string, parentId: number }) {
        const { id, name, parentId } = body;
        await this.organizationService.updateOrganization(id, name, parentId);
        return { code: 200, message: '更新组织成功' };
    }

    @Mutation('deleteOrganization')
    async deleteOrganization(req, body: { id: number }) {
        const { id } = body;
        await this.organizationService.deleteOrganization(id);
        return { code: 200, message: '删除组织成功' };
    }

    @Mutation('addUsersToOrganization')
    async addUsersToOrganization(req, body: { id: number, userIds: number[] }) {
        const { id, userIds } = body;
        await this.organizationService.addUsersToOrganization(id, userIds);
        return { code: 200, message: '添加用户成功' };
    }

    @Mutation('deleteUserFromOrganization')
    async deleteUserFromOrganization(req, body: { id: number, userIds: number[] }) {
        const { id, userIds } = body;
        await this.organizationService.deleteUserFromOrganization(id, userIds);
        return { code: 200, message: '删除用户成功' };
    }
}