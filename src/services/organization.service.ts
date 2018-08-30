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
     * Query root organizations
     */
    async findRoots(): Promise<Organization[]> {
        return this.organizationReq.findRoots();
    }

    /**
     * Query all organizations tree node
     */
    async findAllTrees(): Promise<Organization[]> {
        return this.organizationReq.findTrees();
    }

    /**
     * Query all suborganizations under the specified organization
     *
     * @param id The specified organizaiton id
     */
    async findChildren(id: number): Promise<Organization> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`The organization id of '${id}' does not exist`, 404);
        }
        const children = await this.organizationReq.findDescendantsTree(exist);
        return children;
    }

    /**
     * Create a organization
     *
     * @param name The organization's name
     * @param parentId The organization's parent id
     */
    async createOrganization(name: string, parentId: number): Promise<void> {
        let parent: Organization | undefined;
        if (parentId) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new HttpException(`The organization's parent id of '${parentId}' does not exist`, 404);
            }
        }

        await this.entityCheckService.checkNameExist(Organization, name);

        const organization: Organization = this.organizationReq.create({ name, parent });
        try {
            await this.organizationReq.save(organization);
        } catch (err) {
            throw new HttpException(`Database error: ${err.toString()}`, 500);
        }
    }

    /**
     * Update organization
     *
     * @param id The specified organizaiton id
     * @param name The organization's name
     * @param parentId The organization's parent id
     */
    async updateOrganization(id: number, name: string, parentId: number): Promise<void> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`The organization id of '${id}' does not exist`, 404);
        }

        if (name !== exist.name) {
            await this.entityCheckService.checkNameExist(Organization, name);
        }

        let parent: Organization | undefined;
        if (parentId) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new HttpException(`The organization's parent id of '${parentId}' does not exist`, 404);
            }
        }
        try {
            exist.name = name;
            exist.parent = parent as any;
            await this.organizationReq.save(exist);
        } catch (err) {
            throw new HttpException(`Database error: ${err.toString()}`, 500);
        }
    }

    /**
     * Delete organization
     *
     * @param id The specified organizaiton id
     */
    async deleteOrganization(id: number): Promise<void> {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new HttpException(`The organization id of '${id}' does not exist`, 404);
        }

        const children = await this.organizationReq.findDescendants(exist);
        if (children) {
            throw new HttpException('Cannot delete the organization that have child organizations', 406);
        }
        try {
            await this.organizationReq.delete(id);
        } catch (error) {
            throw new HttpException(`Database error: ${error.toString()}`, 500);
        }
    }

    /**
     * Add users to the organization
     *
     * @param id The specified organizaiton id
     * @param userIds The specified users id to be add
     */
    async addUsersToOrganization(id: number, userIds: number[]): Promise<void> {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new HttpException(`The organization id of '${id}' does not exist`, 404);
        }

        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find: User | undefined = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new HttpException(`The user id of '${userId}' does not exist`, 404);
            }
        });

        exist.users.forEach(user => {
            const find = userIds.find(id => {
                return id === user.id;
            });
            if (find) {
                throw new HttpException(`User with id of ${user.id} is already under organization`, 409);
            }
        });
        exist.users.push(...userArr);
        try {
            await this.organizationReq.save(exist);
        } catch (error) {
            throw new HttpException(`Database error: ${error.toString()}`, 500);
        }
    }

    /**
     * Delete users under the organization
     *
     * @param id The specified organizaiton id
     * @param userIds The specified users id
     */
    async deleteUserFromOrganization(id: number, userIds: number[]): Promise<void> {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new HttpException(`The organization id of '${id}' does not exist`, 404);
        }

        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find: User | undefined = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new HttpException(`The user id of '${userId}' does not exist`, 404);
            }
            const index = exist.users.findIndex(user => {
                return user.id === userId;
            });
            if (index < 0) {
                throw new HttpException(`The user id of '${userId}' does not appear in this organization`, 404);
            }
            exist.users.splice(index, 1);
        });
        try {
            await this.organizationReq.save(exist);
        } catch (err) {
            throw new HttpException(`Database error: ${err.toString()}`, 500);
        }
    }
}