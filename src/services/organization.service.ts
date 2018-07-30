import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpException } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';
import { TreeRepository } from 'typeorm';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization) private readonly organizationReq: TreeRepository<Organization>
    ) { }

    /**
     * 获取根组织
     */
    async getRoots(): Promise<Organization[]> {
        return this.organizationReq.findRoots();
    }

    /**
     * 获取所有组织
     */
    async getAll(): Promise<Organization[]> {
        return this.organizationReq.find();
    }

    /**
     * 获取组织下面的所有部门
     * @param id 组织ID
     */
    async findChildren(id: number): Promise<Organization[]> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 406);
        }
        return this.organizationReq.findDescendants(exist);
    }

    async createOrganization(name: string, parentId: number): Promise<void> {
        const parent = await this.organizationReq.findOne(parentId);
        if (!parent) {
            throw new HttpException(`父组织Id为：${parentId}的组织不存在`, 406);
        }

        const exist = await this.organizationReq.findOne({ name });
        if (!exist) {
            throw new HttpException(`name为：${name}的组织已存在`, 406);
        }

        const organization: Organization = this.organizationReq.create({ name, parent });
        try {
            await this.organizationReq.save(organization);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 401);
        }
    }

    async updateOrganization(id: number, name: string, parentId: number): Promise<void> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 406);
        }

        if (name !== exist.name) {
            const exist: Organization|undefined = await this.organizationReq.findOne({ name });
            if (exist) {
                throw new HttpException(`name为：${name}的组织已存在`, 404);
            }
        }
    }
}