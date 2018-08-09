import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { User } from '../entities/user.entity';
import { JwtReply } from '../interfaces/jwt.interface';
import { UserUpdateInput } from '../interfaces/user.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
        @Inject(RoleService) private readonly roleService: RoleService
    ) { }

    /**
     * 创建用户
     *
     * @param user 用户对象
     */
    async createUser(user: User): Promise<void> {
        await this.checkUsernameExist(user.username);
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
     * 通过ID查找用户
     * @param id 用户ID
     */
    async findOneById(id: number): Promise<User> {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new HttpException('用户不存在', 404);
        }
        return exist;
    }

    /**
     * 通过用户名查询用户及其关联信息(角色、权限)
     *
     * @param username 用户名
     */
    async findOneWithRolesAndPermissions(username: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] });
        if (!user) {
            throw new HttpException('用户不存在', 404);
        }
        return user;
    }

    /**
     * 通过用户角色查询其所有的信息项
     *
     * 注册时，只能注册为一种角色，此时信息项为当前角色下的所有信息项；
     * 注册成功后，管理员可以赋予用户更多的角色，添加角色时，需要补全填写被添加角色的所有信息项的值。
     *
     * 管理员添加用户时，可以给用户赋予一种或多种角色，如果是一种角色，信息项与注册时的信息项逻辑一致；
     * 如果是多种角色，需要把所有角色对应的信息项通过其名称(name)去重，然后补全填写所有信息项的值。
     *
     * 显示用户信息时，直接使用用户 id 去查询 user_info 表中数据即可。
     */
    async findOneWithInfoItemsByRole(roleIds: number[]) {
        return this.roleService.findInfoGroupItemsByIds(roleIds);
    }

    /**
     * 检查用户名是否存在
     *
     * @param username 用户名
     */
    async checkUsernameExist(username: string): Promise<void> {
        if (await this.userRepo.findOne({ where: { username } })) {
            throw new HttpException('用户名已存在', 409);
        }
    }

    /**
     * 用户登录
     *
     * TODO: 登录时，通过用户角色查询其所有的信息项
     *
     * @param username 用户名
     * @param password 密码
     */
    async login(username: string, password: string): Promise<JwtReply> {
        // TODO: 查询用户时，同时查询用户所拥有的所有权限，如果启用了用户模块的缓存选项，则缓存权限
        const user = await this.findOneWithRolesAndPermissions(username);
        if (!await this.cryptoUtil.checkPassword(password, user.password)) {
            throw new HttpException('登录密码错误', 406);
        }

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

    /**
     * 用户注册
     *
     * TODO: 注册只能注册为默认的普通用户，普通用户角色、普通用户的信息组及其信息项默认生成最常用的字段，可以由超级管理员修改
     *
     * @param username 用户名
     * @param password 密码
     */
    async register(username: string, password: string): Promise<void> {
        await this.checkUsernameExist(username);
        password = await this.cryptoUtil.encryptPassword(password);
        this.userRepo.save(this.userRepo.create({ username, password }));
    }
}