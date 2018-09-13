import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { OrganizationService } from '../services/organization.service';

@Controller()
export class OrganizationGrpcController {
    constructor(
        private readonly organizationService: OrganizationService
    ) { }

    @GrpcMethod('OrganizationService')
    async findRootOrganizations() {
        const data = await this.organizationService.findRoots();
        return { code: 200, message: t('Get the root organization successfully'), data };
    }

    @GrpcMethod('OrganizationService')
    async findAllOrganizations() {
        const data = await this.organizationService.findAllTrees();
        return { code: 200, message: t('Get all organizations successful'), data: JSON.stringify(data) };
    }

    @GrpcMethod('OrganizationService')
    async findChildrenOrganizations(payload: { id: number }) {
        const data = await this.organizationService.findChildren(payload.id);
        return { code: 200, message: t('Get all sub-organizations below the organization successfully'), data: JSON.stringify(data) };
    }

    @GrpcMethod('OrganizationService')
    async createOrganization(payload: { name: string, parentId: number }) {
        await this.organizationService.createOrganization(payload.name, payload.parentId);
        return { code: 200, message: t('Create an organizational successfully') };
    }

    @GrpcMethod('OrganizationService')
    async updateOrganization(payload: { id: number, name: string, parentId: number }) {
        await this.organizationService.updateOrganization(payload.id, payload.name, payload.parentId);
        return { code: 200, message: t('Update organization successfully') };
    }

    @GrpcMethod('OrganizationService')
    async deleteOrganization(payload: { id: number }) {
        await this.organizationService.deleteOrganization(payload.id);
        return { code: 200, message: t('Delete organization successfully"') };
    }

    @GrpcMethod('OrganizationService')
    async addUsersToOrganization(payload: { id: number, userIds: number[] }) {
        await this.organizationService.addUsersToOrganization(payload.id, payload.userIds);
        return { code: 200, message: t('Add users to your organization successfully') };
    }

    @GrpcMethod('OrganizationService')
    async deleteUserFromOrganization(payload: { id: number, userIds: number[] }) {
        await this.organizationService.deleteUserFromOrganization(payload.id, payload.userIds);
        return { code: 200, message: t('Delete users from your organization successfully') };
    }
}