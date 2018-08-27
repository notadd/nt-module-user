import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { EntityCheckService } from './entity-check.service';

@Injectable()
export class OrganizationService {
    constructor(
        @Inject(EntityCheckService) private readonly entityCheckService: EntityCheckService,
        @InjectRepository(Organization) private readonly organizationReq: TreeRepository<Organization>,
        @InjectRepository(User) private readonly userRep: Repository<User>
    ) { }

    /**
     * 获取根组织
     */
    async findRoots(): Promise<Organization[]> {
        return this.organizationReq.findRoots();
    }

    /**
     * 获取所有组织
     */
    async findAllTrees(): Promise<Organization[]> {
        return this.organizationReq.findTrees();
    }

    /**
     * 获取组织下面的所有部门
     * @param id 组织ID
     */
    async findChildren(id: number): Promise<Organization> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 404);
        }
        const children = await this.organizationReq.findDescendantsTree(exist);
        return children;
    }

    /**
     * 添加组织
     * @param name 组织名称
     * @param parentId 父组织ID
     */
    async createOrganization(name: string, parentId: number): Promise<void> {
        let parent: Organization | undefined;
        if (parentId !== undefined && parentId !== null) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new HttpException(`父组织Id为：${parentId}的组织不存在`, 404);
            }
        }

        await this.entityCheckService.checkNameExist(Organization, name);

        const organization: Organization = this.organizationReq.create({ name, parent });
        try {
            await this.organizationReq.save(organization);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 500);
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
            throw new HttpException(`id为：${id}的组织不存在`, 404);
        }

        if (name !== exist.name) {
            await this.entityCheckService.checkNameExist(Organization, name);
        }

        let parent: Organization | undefined;
        if (parentId !== undefined && parentId !== null) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new HttpException(`指定父组织id=${parentId}不存在`, 404);
            }
        }
        try {
            exist.name = name;
            exist.parent = parent as any;
            await this.organizationReq.save(exist);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 500);
        }
    }

    /**
     * 删除组织机构
     * @param id
     */
    async deleteOrganization(id: number): Promise<void> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 404);
        }

        const children = await this.organizationReq.findDescendants(exist);
        if (children) {
            throw new HttpException(`存在子组织不能删除`, 406);
        }
        try {
            await this.organizationReq.delete(id);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 500);
        }
    }

    /**
     * 给部门添加用户
     * @param id 部门ID
     * @param userIds 用户ID
     */
    async addUsersToOrganization(id: number, userIds: number[]): Promise<void> {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 404);
        }

        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find: User | undefined = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new HttpException(`id为${userId}用户不存在`, 404);
            }
        });

        exist.users.forEach(user => {
            const find = userIds.find(id => {
                return id === user.id;
            });
            if (find) {
                throw new HttpException(`id为${user.id}用户已在组织下`, 409);
            }
        });
        exist.users.push(...userArr);
        try {
            await this.organizationReq.save(exist);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 500);
        }
    }

    /**
     * 删除组织下的用户
     * @param id 组织ID
     * @param userIds 用户ID
     */
    async deleteUserFromOrganization(id: number, userIds: number[]): Promise<void> {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new HttpException(`id为：${id}的组织不存在`, 404);
        }

        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find: User | undefined = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new HttpException(`id为${userId}用户不存在`, 404);
            }
            const index = exist.users.findIndex(user => {
                return user.id === userId;
            });
            if (index < 0) {
                throw new HttpException(`id为${userId}用户不存在组织下`, 404);
            }
            exist.users.splice(index, 1);
        });
        try {
            await this.organizationReq.save(exist);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 500);
        }
    }
}