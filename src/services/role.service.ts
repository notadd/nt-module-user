import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '../entities';

@Injectable()
export class RoleService {
    constructor (
        @InjectRepository(Role) private readonly roleRep: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRep: Repository<Permission>
    ) {}

    /**
     * 添加角色
     * @param name
     */
    async createRole(name: string) {
        const exist = await this.roleRep.findOne({name});
        if (exist) {
            new HttpException(`name为${name}的角色已存在`, 402);
        }
        const role = this.roleRep.create({name});
        try {
            await this.roleRep.save(role);
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
        const role = await this.roleRep.findOne(id);
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        if (name !== role.name) {
            const exist = await this.roleRep.findOne({name});
            if (exist) {
                new HttpException(`name为${name}的角色已存在`, 402);
            }
        }

        role.name = name;
        try {
            await this.roleRep.save(role);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }

    /**
     * 删除角色
     * @param id
     */
    async deleteRole(id: number) {
        const role = await this.roleRep.findOne(id);
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        try {
            await this.roleRep.delete(role);
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
        const role = await this.roleRep.findOne(id);
        if (!role) {
            new HttpException(`id为${id}的角色不存在`, 404);
        }

        const permissionArr = await this.permissionRep.findByIds(permissionIds);
        permissionIds.forEach(permissionId => {
            const exist: Permission|undefined = permissionArr.find(permission => {
                return permission.id === permissionId;
            });

            if (!exist) {
                throw new HttpException(`id为${permissionId}的权限不存在`, 404);
            }
        });

        role.permissions = permissionArr;
        try {
            await this.roleRep.save(role);
        } catch (error) {
            throw new HttpException(`数据库错误：${error.toString()}`, 401);
        }
    }
}