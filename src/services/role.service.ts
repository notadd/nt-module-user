import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InfoItem } from '../entities/info-item.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>
    ) { }

    /**
     * 添加角色
     * @param name
     */
    async createRole(name: string) {
        const exist = await this.roleRepo.findOne({ name });
        if (exist) {
            new HttpException(`name为${name}的角色已存在`, 402);
        }
        const role = this.roleRepo.create({ name });
        try {
            await this.roleRepo.save(role);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }

    /**
     * 修改角色
     * @param id
     * @param name
     */
    async updateRole(id: number, name: string) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        if (name !== role.name) {
            const exist = await this.roleRepo.findOne({ name });
            if (exist) {
                new HttpException(`name为${name}的角色已存在`, 402);
            }
        }

        role.name = name;
        try {
            await this.roleRepo.save(role);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }

    /**
     * 删除角色
     * @param id
     */
    async deleteRole(id: number) {
        const role = await this.roleRepo.findOne(id, { relations: ['permissions'] });
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        try {
            this.roleRepo.createQueryBuilder('role').relation(Role, 'permissions').of(role).remove(role.permissions);
            await this.roleRepo.remove(role);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 401);
        }
    }

    /**
     * 给角色设置权限
     * @param id 角色ID
     * @param permissionIds 权限ID数组
     */
    async setPermissions(id: number, permissionIds: number[]) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        const permissionArr = await this.permissionRepo.findByIds(permissionIds);
        permissionIds.forEach(permissionId => {
            const exist: Permission | undefined = permissionArr.find(permission => {
                return permission.id === permissionId;
            });

            if (!exist) {
                throw new HttpException(`id为${permissionId}的权限不存在`, 404);
            }
        });

        role.permissions = permissionArr;
        try {
            await this.roleRepo.save(role);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }

    async findRoles() {
        return this.roleRepo.find();
    }

    /**
     * 查询角色所属信息组下的所有信息项
     *
     * @param id 角色ID
     */
    async findInfoGroupItemsByIds(ids: number[]) {
        let infoItemsArr: InfoItem[] = [];
        const roles = await this.roleRepo.findByIds(ids, { relations: ['infoGroup', 'infoGroup.infoItem'] });
        roles.forEach(role => {
            role.infoGroups.forEach(infoGroup => infoGroup.infoItems.forEach(infoItem => infoItemsArr.push(infoItem)));
        });

        const temp = {};
        infoItemsArr = infoItemsArr.reduce((item, next) => {
            temp[next.name] ? '' : temp[next.name] = true && item.push(next);
            return item;
        }, []);

        return infoItemsArr;
    }
}