import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { Repository } from 'typeorm';

import { InfoItem } from '../entities/info-item.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RoleInfoData } from '../interfaces/role.interface';
import { EntityCheckService } from './entity-check.service';

@Injectable()
export class RoleService {
    constructor(
        @Inject(EntityCheckService) private readonly entityCheckService: EntityCheckService,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>
    ) { }

    /**
     * Create a role
     *
     * @param name The role's name
     */
    async createRole(name: string) {
        await this.entityCheckService.checkNameExist(Role, name);
        await this.roleRepo.save(this.roleRepo.create({ name }));
    }

    /**
     * Update the specified role's name
     *
     * @param id The specified role's id
     * @param name The name to be update
     */
    async updateRole(id: number, name: string) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            throw new HttpException(t('The role id of %s does not exist', id.toString()), 404);
        }

        if (name !== role.name) {
            await this.entityCheckService.checkNameExist(Role, name);
        }

        role.name = name;
        await this.roleRepo.save(role);
    }

    /**
     * Delete role
     *
     * @param id The specified role's id
     */
    async deleteRole(id: number) {
        const role = await this.roleRepo.findOne(id, { relations: ['permissions'] });
        if (!role) {
            throw new HttpException(t('The role id of %s does not exist', id.toString()), 404);
        }

        try {
            this.roleRepo.createQueryBuilder('role').relation(Role, 'permissions').of(role).remove(role.permissions);
            await this.roleRepo.remove(role);
        } catch (err) {
            throw new HttpException(t('Database error %s', err.toString()), 500);
        }
    }

    /**
     * Remove a permission from role
     *
     * @param id The specified role's id
     * @param permissionId The specified permission's id to be remove
     */
    async removePermission(id: number, permissionId: number) {
        await this.roleRepo.createQueryBuilder().relation(Role, 'permissions').of(id).remove(permissionId);
    }

    /**
     * Set permissions for a role
     *
     * @param id The specified role's id
     * @param permissionIds The specified permission's id to be set
     */
    async setPermissions(id: number, permissionIds: number[]) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            throw new HttpException(t('The role id of %s does not exist', id.toString()), 404);
        }

        const permissionArr = await this.permissionRepo.findByIds(permissionIds);
        permissionIds.forEach(permissionId => {
            const exist: Permission | undefined = permissionArr.find(permission => {
                return permission.id === permissionId;
            });

            if (!exist) {
                throw new HttpException(t('The permission id of %s does not exist', permissionId.toString()), 404);
            }
        });

        role.permissions = permissionArr;
        await this.roleRepo.save(role);
    }

    /**
     * Query all roles
     */
    async findRoles(pageNumber?: number, pageSize?: number) {
        if (pageNumber && pageSize) {
            return this.roleRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
        }
        return this.roleRepo.find();
    }

    /**
     * Query all associated information for a specified role
     *
     * @param roleId The specified role's id
     */
    async findOneRoleInfo(roleId: number) {
        const role = await this.roleRepo.findOne(roleId, { relations: ['permissions'] });

        if (!role) {
            throw new HttpException(t('The role id of %s does not exist', roleId.toString()), 404);
        }

        const roleInfoData: RoleInfoData = {
            id: role.id,
            name: role.name,
            permissions: (role.permissions && role.permissions.length > 0) ? role.permissions : [],
            infoItems: await this.findInfoGroupItemsByIds([roleId])
        };
        return roleInfoData;
    }

    /**
     * Query all information items under the information group to which the role belongs
     *
     * @param ids Role ID array
     */
    async findInfoGroupItemsByIds(ids: number[]) {
        let infoItemsArr: InfoItem[] = [];
        const roles = await this.roleRepo.createQueryBuilder('role')
            .leftJoinAndSelect('infoGroup', 'infoGroup')
            .leftJoinAndSelect('infoGroup.infoItems', 'infoItems')
            .whereInIds(ids)
            .orderBy('infoItems.order', 'ASC')
            .getMany();

        if (!roles || roles.length === 0) {
            return infoItemsArr;
        }

        roles.forEach(role => {
            if (role.infoGroup && role.infoGroup.infoItems && role.infoGroup.infoItems.length > 0) {
                role.infoGroup.infoItems.forEach(infoItem => infoItemsArr.push(infoItem));
            }
        });

        const temp = {};
        infoItemsArr = infoItemsArr.reduce((item, next) => {
            temp[next.name] ? '' : temp[next.name] = item.push(next);
            return item;
        }, []);

        return infoItemsArr;
    }
}