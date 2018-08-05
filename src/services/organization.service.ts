import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';

import { Organization } from '../entities/organization.entity';

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

    /**
     * 添加组织
     * @param name 组织名称
     * @param parentId 父组织ID
     */
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

    /**
     * 更新组织
     * @param id 组织ID
     * @param name 组织名称
     * @param parentId 父组织ID
     */
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

        let parent: Organization|undefined ;
        if (parentId !== undefined && parentId !== null) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new HttpException(`指定父组织id=${parentId}不存在`, 402);
            }
        }
        try {
            exist.name = name;
            exist.parent = parent as any;
            await this.organizationReq.save(exist);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 401);
        }
    }

    /**
     * 删除组织机构
     * @param id 
     */
    async deleteOrganization(id: number): Promise<void> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 406);
        }

        const children = await this.organizationReq.findDescendants(exist);
        if (children) {
            throw new HttpException(`存在子组织不能删除`, 406);
        } 
        try {
            await this.organizationReq.delete(id);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }
}