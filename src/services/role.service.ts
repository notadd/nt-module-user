import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
    constructor (
        @InjectRepository(Role) private readonly roleRep: Repository<Role>
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
}