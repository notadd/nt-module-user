import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { __ as t } from 'i18n';

import { Permission, Resource } from '../decorators';
import { CommonResult } from '../interfaces/common-result.interface';
import { OrganizationService } from './../services/organization.service';

@Resolver()
@Resource({ name: 'organization_manage', identify: 'organization:manage' })
export class OrganizationResolver {
    constructor(
        private readonly organizationService: OrganizationService
    ) { }

    @Query('findRootOrganizations')
    @Permission({ name: 'find_root_organizations', identify: 'organization:findRootOrganizations', action: 'find' })
    async findRootOrganizations(): Promise<CommonResult> {
        const data = await this.organizationService.findRoots();
        return { code: 200, message: t('Get the root organization successfully'), data };
    }

    @Query('findAllOrganizations')
    @Permission({ name: 'find_all_organizations', identify: 'organization:findAllOrganizations', action: 'find' })
    async findAllOrganizations(): Promise<CommonResult> {
        const data = await this.organizationService.findAllTrees();
        return { code: 200, message: t('Get all organizations successful'), data };
    }

    @Query('findChildrenOrganizations')
    @Permission({ name: 'find_children_organizations', identify: 'organization:findChildrenOrganizations', action: 'find' })
    async findChildrenOrganizations(req, body: { id: number }): Promise<CommonResult> {
        const data = await this.organizationService.findChildren(body.id);
        return { code: 200, message: t('Get all sub-organizations below the organization successfully'), data };
    }

    @Mutation('createOrganization')
    @Permission({ name: 'create_organization', identify: 'organization:createOrganization', action: 'create' })
    async createOrganization(req, body: { name: string, parentId: number }): Promise<CommonResult> {
        await this.organizationService.createOrganization(body.name, body.parentId);
        return { code: 200, message: t('Create an organizational successfully') };
    }

    @Mutation('updateOrganization')
    @Permission({ name: 'update_organization', identify: 'organization:updateOrganization', action: 'update' })
    async updateOrganization(req, body: { id: number, name: string, parentId: number }): Promise<CommonResult> {
        await this.organizationService.updateOrganization(body.id, body.name, body.parentId);
        return { code: 200, message: t('Update organization successfully') };
    }

    @Mutation('deleteOrganization')
    @Permission({ name: 'delete_organization', identify: 'organization:deleteOrganization', action: 'delete' })
    async deleteOrganization(req, body: { id: number }): Promise<CommonResult> {
        await this.organizationService.deleteOrganization(body.id);
        return { code: 200, message: t('Delete organization successfully"') };
    }

    @Mutation('addUsersToOrganization')
    @Permission({ name: 'add_users_to_organization', identify: 'organization:addUsersToOrganization', action: 'create' })
    async addUsersToOrganization(req, body: { id: number, userIds: number[] }): Promise<CommonResult> {
        await this.organizationService.addUsersToOrganization(body.id, body.userIds);
        return { code: 200, message: t('Add users to your organization successfully') };
    }

    @Mutation('deleteUserFromOrganization')
    @Permission({ name: 'delete_user_from_organization', identify: 'organization:deleteUserFromOrganization', action: 'delete' })
    async deleteUserFromOrganization(req, body: { id: number, userIds: number[] }): Promise<CommonResult> {
        await this.organizationService.deleteUserFromOrganization(body.id, body.userIds);
        return { code: 200, message: t('Delete users from your organization successfully') };
    }
}