import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService } from '../auth';
import { User } from '../entities';
import { UserUpdateInput } from '../interfaces';
import { CryptoUtil } from '../utils/crypto.util';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
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
    async findOneByUsername(username: string): Promise<User> {
        const exist = this.userRepo.findOne({ where: { username } });
        if (!exist) {
            throw new HttpException('用户名错误', 406);
        }
        return exist;
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

    /**
     * 通过用户名查询用户及其关联信息(角色、权限)
     *
     * @param username 用户名
     */
    async findUserWithRelations(username: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] });
        if (!user) {
            throw new HttpException('用户不存在', 404);
        }
        return user;
    }

    async login(username: string, password: string) {
        // TODO: 查询用户时，同时查询用户所拥有的所有权限，如果启用了用户模块的缓存选项，则缓存权限
        const user = await this.findUserWithRelations(username);
        // if (user.password !== await this.cryptoUtil.encryptPassword(password)) {
        //     throw new HttpException('登录密码错误', 406);
        // }

        // TODO: 缓存权限的数据结构
        // const permissions: string[] = [];
        // user.roles.forEach(role => {
        //     role.permissions.forEach(permission => {
        //         permissions.push(permission.identify);
        //     });
        // });

        // FIXME: 使用什么数据生成 accessToken？
        return this.authService.createToken({ username });
    }
}