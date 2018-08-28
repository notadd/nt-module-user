import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
     * 添加角色
     * @param name
     */
    async createRole(name: string) {
        await this.entityCheckService.checkNameExist(Role, name);
        await this.roleRepo.save(this.roleRepo.create({ name }));
    }

    /**
     * 修改角色
     * @param id
     * @param name
     */
    async updateRole(id: number, name: string) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            throw new HttpException(`id为${id}的角色不存在`, 404);
        }

        if (name !== role.name) {
            await this.entityCheckService.checkNameExist(Role, name);
        }

        role.name = name;
        await this.roleRepo.save(role);
    }

    /**
     * 删除角色
     * @param id
     */
    async deleteRole(id: number) {
        const role = await this.roleRepo.findOne(id, { relations: ['permissions'] });
        if (!role) {
            throw new HttpException(`id为${id}的角色不存在`, 404);
        }

        try {
            this.roleRepo.createQueryBuilder('role').relation(Role, 'permissions').of(role).remove(role.permissions);
            await this.roleRepo.remove(role);
        } catch (err) {
            throw new HttpException(`数据库错误：${err.toString()}`, 500);
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
            throw new HttpException(`id为${id}的角色不存在`, 404);
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
        await this.roleRepo.save(role);
    }

    /**
     * 查询所有角色
     */
    async findRoles() {
        return this.roleRepo.find();
    }

    /**
     * 查询指定角色的所有关联信息(角色基本信息、角色拥有的权限、角色拥有的信息项)
     * @param roleId 角色ID
     */
    async findOneRoleInfo(roleId: number) {
        const role = await this.roleRepo.findOne(roleId, { relations: ['permissions'] });

        if (!role) {
            throw new HttpException('指定角色不存在', 404);
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
     * 查询角色所属信息组下的所有信息项
     *
     * @param ids 角色ID数组
     * @param registerDisplay 是否是注册页数据
     * @param informationDisplay 是否是资料页数据
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