import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities';
import { UserUpdateInput } from '../interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) { }

    /**
     * 创建用户
     *
     * @param operatorId 操作员ID
     * @param user 用户对象
     */
    async createUser(operatorId: number, user: User): Promise<void> {
        if (await this.findOneByUsername(user.username)) {
            throw new HttpException('用户名已存在', 409);
        }
        user.createBy = user.updateBy = operatorId;
        this.userRepo.save(this.userRepo.create(user));
    }

    /**
     * 删除用户
     * @param id 用户ID
     */
    async deleteUser(id: number): Promise<void> {
        await this.findOneById(id);
        this.userRepo.delete(id);
    }

    /**
     * 更新用户
     *
     * @param id 用户ID
     * @param userUpdateInput 用户更新的信息数据
     */
    async updateUser(id: number, userUpdateInput: UserUpdateInput): Promise<void> {
        const exist = await this.findOneById(id);
        this.userRepo.save({ ...exist, ...userUpdateInput });
    }

    /**
     * 通过用户名查找用户
     *
     * @param username 用户名
     */
    async findOneByUsername(username: string): Promise<User | undefined> {
        return this.userRepo.findOne(username);
    }

    /**
     * 通过ID查找用户
     * @param id 用户ID
     */
    async findOneById(id: number): Promise<User> {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new HttpException('该用户不存在', 404);
        }
        return exist;
    }
}