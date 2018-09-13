import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { EntityManager, Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { InfoItem } from '../entities/info-item.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { UserInfo } from '../entities/user-info.entity';
import { User } from '../entities/user.entity';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserInfo) private readonly userInfoRepo: Repository<UserInfo>,
        @InjectRepository(InfoItem) private readonly infoItemRepo: Repository<InfoItem>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
        @Inject(RoleService) private readonly roleService: RoleService
    ) { }

    /**
     * Cteate a user
     *
     * @param user The user object
     */
    async createUser(createUserInput: CreateUserInput): Promise<void> {
        await this.checkUsernameExist(createUserInput.username);
        createUserInput.password = await this.cryptoUtil.encryptPassword(createUserInput.password);
        const user = await this.userRepo.save(this.userRepo.create(createUserInput));
        if (createUserInput.roleIds && createUserInput.roleIds.length) {
            await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).add(createUserInput.roleIds);
        }
        if (createUserInput.organizationIds && createUserInput.organizationIds.length) {
            await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).add(createUserInput.organizationIds);
        }
        if (createUserInput.infoKVs && createUserInput.infoKVs.length) {
            await this.createOrUpdateUserInfos(user, createUserInput.infoKVs, 'create');
        }
    }

    /**
     * Add a role to the user
     *
     * @param userId The specified user id
     * @param roleId The specified role id
     */
    async addUserRole(userId: number, roleId: number) {
        await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(userId).add(roleId);
    }

    /**
     * Delete a role from the user
     *
     * @param userId The specified user id
     * @param roleId The specified role id
     */
    async deleteUserRole(userId: number, roleId: number) {
        await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(userId).remove(roleId);
    }

    /**
     * Delete user to recycle bin
     *
     * @param id The specified user id
     */
    async recycleUser(id: number): Promise<void> {
        const user = await this.findOneById(id);
        user.recycle = true;
        await this.userRepo.save(user);
    }

    /**
     * Delete users in the recycle bin
     *
     * @param id The specified user id
     */
    async deleteUser(id: number): Promise<void> {
        const user = await this.userRepo.findOne(id, { relations: ['roles', 'organizations'] });
        await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).remove(user.roles);
        await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).remove(user.organizations);
        await this.userRepo.remove(user);
    }

    /**
     * Update user's information
     *
     * @param id The specified user id
     * @param updateUserInput The information to be update
     */
    async updateUserInfo(id: number, updateUserInput: UpdateUserInput): Promise<void> {
        const user = await this.userRepo.findOne(id, { relations: ['userInfos'] });
        if (updateUserInput.email) {
            await this.userRepo.update(user.id, { email: updateUserInput.email });
        }
        if (updateUserInput.mobile) {
            await this.userRepo.update(user.id, { mobile: updateUserInput.mobile });
        }
        if (updateUserInput.password) {
            const newPassword = await this.cryptoUtil.encryptPassword(updateUserInput.password);
            await this.userRepo.update(user.id, { password: newPassword });
        }
        if (updateUserInput.roleIds && updateUserInput.roleIds.length) {
            updateUserInput.roleIds.forEach(async roleId => {
                await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).remove(roleId.before);
                await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).add(roleId.after);
            });
        }
        if (updateUserInput.organizationIds && updateUserInput.organizationIds.length) {
            updateUserInput.organizationIds.forEach(async organizationId => {
                await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).remove(organizationId.before);
                await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).add(organizationId.after);
            });
        }
        if (updateUserInput.infoKVs && updateUserInput.infoKVs.length) {
            await this.createOrUpdateUserInfos(user, updateUserInput.infoKVs, 'update');
        }
    }

    /**
     * Query the user by role ID
     *
     * @param roleId The specified role id
     */
    async findByRoleId(roleId: number) {
        const users = await this.entityManager.createQueryBuilder().relation(Role, 'users').of(roleId).loadMany<User>();
        if (!users.length) {
            throw new RpcException({ code: 404, message: t('No users belong to this role') });
        }
        return this.findUserInfoById(users.map(user => user.id)) as Promise<UserInfoData[]>;
    }

    /**
     * Query users that belongs to the organization
     *
     * @param id The specified organization id
     */
    async findByOrganizationId(organizationId: number): Promise<UserInfoData[]> {
        const users = await this.entityManager.createQueryBuilder().relation(Organization, 'users').of(organizationId).loadMany<User>();
        if (!users.length) {
            throw new RpcException({ code: 404, message: t('No users belong to this role') });
        }
        return this.findUserInfoById(users.map(user => user.id)) as Promise<UserInfoData[]>;
    }

    /**
     * Querying users and their associated information by username
     *
     * @param username username
     */
    async findOneWithRolesAndPermissions(username: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] });
        if (!user) {
            throw new RpcException({ code: 404, message: t('User does not exist') });
        }
        return user;
    }

    /**
     * Querying user information by user ID
     *
     * @param id The specified user id
     */
    async findUserInfoById(id: number | number[]): Promise<UserInfoData | UserInfoData[]> {
        const userQb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('user.organizations', 'organizations')
            .leftJoinAndSelect('user.userInfos', 'userInfos')
            .leftJoinAndSelect('userInfos.infoItem', 'infoItem');

        const infoItemQb = await this.infoItemRepo.createQueryBuilder('infoItem')
            .leftJoin('infoItem.infoGroups', 'infoGroups')
            .leftJoin('infoGroups.role', 'role')
            .leftJoin('role.users', 'users');

        if (id instanceof Array) {
            const userInfoData: UserInfoData[] = [];
            const users = await userQb.whereInIds(id).getMany();
            const infoItems = await infoItemQb.where('users.id IN (:...id)', { id }).orderBy('infoItem.order', 'ASC').getMany();
            for (const user of users) {
                (userInfoData as UserInfoData[]).push(this.refactorUserData(user, infoItems));
            }
            return userInfoData;
        } else {
            const user = await userQb.where('user.id = :id', { id }).getOne();
            const infoItem = await infoItemQb.where('users.id = :id', { id }).orderBy('infoItem.order', 'ASC').getMany();
            return this.refactorUserData(user, infoItem);
        }
    }

    /**
     * Querying all of its information items through a user role
     *
     * @param roleIds The specified role id array
     */
    async findOneWithInfoItemsByRoleIds(roleIds: number[]) {
        return this.roleService.findInfoGroupItemsByIds(roleIds);
    }

    /**
     * user login
     *
     * @param username username
     * @param password password
     */
    async login(username: string, password: string) {
        const user = await this.userRepo.findOne({ where: { username }, relations: ['roles', 'organizations', 'userInfos', 'userInfos.infoItem'] });
        if (!user) throw new RpcException({ code: 404, message: t('User does not exist') });
        if (user.banned || user.recycle) throw new RpcException({ code: 400, message: t('User is banned') });
        const infoItem = await this.infoItemRepo.createQueryBuilder('infoItem')
            .leftJoin('infoItem.infoGroups', 'infoGroups')
            .leftJoin('infoGroups.role', 'role')
            .leftJoin('role.users', 'users')
            .where('users.username = :username', { username })
            .orderBy('infoItem.order', 'ASC')
            .getMany();

        const userInfoData = this.refactorUserData(user, infoItem);
        if (!await this.cryptoUtil.checkPassword(password, user.password)) {
            throw new HttpException(t('invalid password'), 406);
        }
        const tokenInfo = await this.authService.createToken({ username });
        return { tokenInfo, userInfoData };
    }

    /**
     * Ordinary user registration
     *
     * @param username username
     * @param password password
     */
    async register(createUserInput: CreateUserInput): Promise<void> {
        createUserInput.roleIds = [1];
        await this.createUser(createUserInput);
    }

    /**
     * Query users by ID
     *
     * @param id The specified user id
     */
    private async findOneById(id: number): Promise<User> {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new RpcException({ code: 404, message: t('User does not exist') });
        }
        return exist;
    }

    /**
     * Check if the username exists
     *
     * @param username username
     */
    private async checkUsernameExist(username: string): Promise<void> {
        if (await this.userRepo.findOne({ where: { username } })) {
            throw new RpcException({ code: 409, message: t('Username already exists') });
        }
    }

    /**
     * Create or update the value of a user information item
     *
     * @param user The user object
     * @param infoKVs Information item key-value pair, key is the ID of the information item (infoItem.id),
     * and the value is the value of the information item (userInfo.value)
     *
     * @param action Operation type, create or update (create | update)
     */
    private async createOrUpdateUserInfos(user: User, infoKVs: { key: number, value: string, relationId?: number }[], action: 'create' | 'update') {
        if (infoKVs.length) {
            if (action === 'create') {
                infoKVs.forEach(async infoKV => {
                    await this.userInfoRepo.save(this.userInfoRepo.create({ value: infoKV.value, user, infoItem: { id: infoKV.key } }));
                });
                return;
            }

            infoKVs.forEach(async infoKV => {
                if (infoKV.key) {
                    await this.userInfoRepo.update(infoKV.key, { value: infoKV.value });
                } else {
                    await this.userInfoRepo.save(this.userInfoRepo.create({ value: infoKV.value, user, infoItem: { id: infoKV.relationId } }));
                }
            });
        }
    }

    /**
     * Refactor the user information data
     *
     * @param user The user object
     */
    private refactorUserData(user: User, infoItems: InfoItem[]) {
        const userInfoData: UserInfoData = {
            userId: user.id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            banned: user.banned,
            recycle: user.recycle,
            createTime: user.createTime,
            updateTime: user.updateTime,
            userRoles: user.roles,
            userOrganizations: user.organizations,
            userInfos: infoItems.length ? infoItems.map(infoItem => {
                const userInfo = user.userInfos.find(userInfo => userInfo.infoItem.id === infoItem.id);
                return {
                    id: user.userInfos.length ? (userInfo ? userInfo.id : undefined) : undefined,
                    order: infoItem.order,
                    relationId: infoItem.id,
                    type: infoItem.type,
                    name: infoItem.name,
                    value: user.userInfos.length ? (userInfo ? userInfo.value : undefined) : undefined,
                    description: infoItem.description,
                    registerDisplay: infoItem.registerDisplay,
                    informationDisplay: infoItem.informationDisplay
                };
            }) : []
        };
        return userInfoData;
    }
}