import { OrganizationService } from './../services/organization.service';
import { Resolver } from '@nestjs/graphql';

@Resolver()
export class OrganizationResolver {
    constructor (
        private readonly organizationService: OrganizationService
    ) {}

    async getRoots() {
        const roots = await this.organizationService.getRoots();
        return {code: 200, message: '获取成功', data: roots};
    }

    async getAll() {
        const organizationArr = await this.organizationService.getAll();
        return {code: 200, message: '获取成功', data: organizationArr};
    }

    async findChildren(req, body: {id: number}) {
        const {id} = body;
        const organizationArr = await this.organizationService.findChildren(id);
        return {code: 200, message: '获取成功', data: organizationArr};
    }

    async createOrganization(req, body: {name: string, parentId: number}) {
        const {name, parentId} = body;
        await this.organizationService.createOrganization(name, parentId);
        return {code: 200, message: '添加成功'};
    }

    async updateOrganization(req, body: {id: number, name: string, parentId: number}) {
        const {id, name, parentId} = body;
        await this.organizationService.updateOrganization(id, name, parentId);
        return {code: 200, message: '更新成功'};
    }
}