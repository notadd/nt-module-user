import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { __ as t } from 'i18n';
import { Repository } from 'typeorm';

import { InfoItem } from '../entities/info-item.entity';
import { Permission } from '../entities/permission.entity';
import { PersonalPermission } from '../entities/personal-permission.entity';
import { UserInfo } from '../entities/user-info.entity';
import { User } from '../entities/user.entity';
import {
    CreateUserInfoKVs,
    CreateUserInput,
    UpdateUserInfoKVs,
    UpdateUserInput,
    UserInfoData
} from '../interfaces/user.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(PersonalPermission) private readonly personalPermissionRepo: Repository<PersonalPermission>,
        @InjectRepository(UserInfo) private readonly userInfoRepo: Repository<UserInfo>,
        @InjectRepository(InfoItem) private readonly infoItemRepo: Repository<InfoItem>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
        @Inject(RoleService) private readonly roleService: RoleService,
    ) { }

    /**
     * Cteate a user
     *
     * @param user The user object
     */
    async createUser(createUserInput: CreateUserInput): Promise<void> {
        if (!(createUserInput.username || createUserInput.mobile || createUserInput.email)) {
            throw new RpcException({ code: 406, message: t('Please make sure the username, mobile phone number, and email exist at least one') });
        }
        if (createUserInput.username && await this.userRepo.findOne({ where: { username: createUserInput.username } })) {
            throw new RpcException({ code: 409, message: t('Username already exists') });
        }
        if (createUserInput.mobile && await this.userRepo.findOne({ where: { mobile: createUserInput.mobile } })) {
            throw new RpcException({ code: 409, message: t('Mobile already exists') });
        }
        if (createUserInput.email && await this.userRepo.findOne({ where: { email: createUserInput.email } })) {
            throw new RpcException({ code: 409, message: t('Email already exists') });
        }
        if (createUserInput.password) {
            createUserInput.password = await this.cryptoUtil.encryptPassword(createUserInput.password);
        }
        if (createUserInput.email) createUserInput.email = createUserInput.email.toLocaleLowerCase();
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
     * Add a personal permission to user
     *
     * @param userId The specified user id
     * @param permissionId The specified permission id
     */
    async addPermissionToUser(userId: number, permissionId: number) {
        await this.addOrDeletePermissionForUser(userId, permissionId, 'increase');
    }

    /**
     * Delete a permission of specified user
     *
     * @param userId The specified user id
     * @param permissionId The specified permission id
     */
    async deletePermissionOfUser(userId: number, permissionId: number) {
        await this.addOrDeletePermissionForUser(userId, permissionId, 'decrease');
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
     * Delete user to recycle bin or ban user
     *
     * @param id The specified user id
     */
    async recycleOrBanUser(id: number, action: 'recycle' | 'ban'): Promise<void> {
        const user = await this.findOneById(id);
        if (action === 'recycle') {
            user.recycle = true;
        }
        if (action === 'ban') {
            user.banned = true;
        }
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
     * Revert user from which was banned or recycled
     *
     * @param id The specified user id
     */
    async revertBannedOrRecycledUser(id: number, status: 'recycled' | 'banned') {
        const user = await this.findOneById(id);
        if (status === 'recycled') {
            user.recycle = false;
        }
        if (status === 'banned') {
            user.banned = false;
        }
        await this.userRepo.save(user);
    }

    /**
     * Update user's information
     *
     * @param id The specified user id
     * @param updateUserInput The information to be update
     */
    async updateUserInfo(id: number, updateUserInput: UpdateUserInput): Promise<void> {
        const user = await this.userRepo.findOne(id, { relations: ['userInfos'] });
        if (updateUserInput.username && updateUserInput.username !== user.username) {
            if (await this.userRepo.findOne({ where: { username: updateUserInput.username } })) {
                throw new RpcException({ code: 409, message: t('Username already exists') });
            }
            await this.userRepo.update(user.id, { username: updateUserInput.username });
        }
        if (updateUserInput.mobile && updateUserInput.mobile !== user.mobile) {
            if (await this.userRepo.findOne({ where: { mobile: updateUserInput.mobile } })) {
                throw new RpcException({ code: 409, message: t('Mobile already exists') });
            }
            await this.userRepo.update(user.id, { mobile: updateUserInput.mobile });
        }
        if (updateUserInput.email && updateUserInput.email.toLocaleLowerCase() !== user.email) {
            if (await this.userRepo.findOne({ where: { email: updateUserInput.email.toLocaleLowerCase() } })) {
                throw new RpcException({ code: 409, message: t('Email already exists') });
            }
            await this.userRepo.update(user.id, { email: updateUserInput.email.toLocaleLowerCase() });
        }
        if (updateUserInput.password) {
            const newPassword = await this.cryptoUtil.encryptPassword(updateUserInput.password);
            await this.userRepo.update(user.id, { password: newPassword });
        }
        if (updateUserInput.banned !== undefined) {
            await this.userRepo.update(user.id, { banned: updateUserInput.banned });
        }
        if (updateUserInput.recycle !== undefined) {
            await this.userRepo.update(user.id, { recycle: updateUserInput.recycle });
        }
        if (updateUserInput.roleIds && updateUserInput.roleIds.length) {
            for (const roleId of updateUserInput.roleIds) {
                await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).remove(roleId.before);
                await this.userRepo.createQueryBuilder('user').relation(User, 'roles').of(user).add(roleId.after);
            }
        }
        if (updateUserInput.organizationIds && updateUserInput.organizationIds.length) {
            for (const organizationId of updateUserInput.organizationIds) {
                await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).remove(organizationId.before);
                await this.userRepo.createQueryBuilder('user').relation(User, 'organizations').of(user).add(organizationId.after);
            }
        }
        if (updateUserInput.infoKVs && updateUserInput.infoKVs.length) {
            await this.createOrUpdateUserInfos(user, updateUserInput.infoKVs, 'update');
        }
    }

    /**
     * Query all users
     */
    async findAllUsers(pageNumber?: number, pageSize?: number) {
        if (pageNumber && pageSize) {
            const usersAndCount = await this.userRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
            const usersInfo = await this.findUserInfoById(usersAndCount[0].map(u => u.id)) as UserInfoData[];
            return { count: usersAndCount[1], usersInfo };
        }
        const users = await this.userRepo.find();
        return this.findUserInfoById(users.map(u => u.id)) as Promise<UserInfoData[]>;
    }

    /**
     * Query the user by role ID
     *
     * @param roleId The specified role id
     */
    async findByRoleId(roleId: number, pageNumber?: number, pageSize?: number) {
        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('roles.id = :roleId', { roleId })
            .andWhere('user.recycle = false');

        let users: User[];
        let count: number;
        if (pageNumber && pageSize) {
            const usersAndCount = await qb.skip((pageNumber - 1) * pageSize).take(pageSize).getManyAndCount();
            users = usersAndCount[0];
            count = usersAndCount[1];
        } else {
            users = await qb.getMany();
        }
        if (!users.length) {
            throw new RpcException({ code: 404, message: t('No users belong to this role') });
        }
        const usersInfo = await this.findUserInfoById(users.map(user => user.id)) as UserInfoData[];
        return { usersInfo, count };
    }

    /**
     * Query users that belongs to the organization
     *
     * @param id The specified organization id
     */
    async findByOrganizationId(organizationId: number, pageNumber?: number, pageSize?: number) {
        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.organizations', 'organizations')
            .where('organizations.id = :organizationId', { organizationId })
            .andWhere('user.recycle = false');

        let users: User[];
        let count: number;
        if (pageNumber && pageSize) {
            const usersAndCount = await qb.skip((pageNumber - 1) * pageSize).take(pageSize).getManyAndCount();
            users = usersAndCount[0];
            count = usersAndCount[1];
        } else {
            users = await qb.getMany();
        }
        if (!users.length) {
            throw new RpcException({ code: 404, message: t('No users belong to this organization') });
        }
        const usersInfo = await this.findUserInfoById(users.map(user => user.id)) as UserInfoData[];
        return { usersInfo, count };
    }

    /**
     * Querying users and their associated information by username
     *
     * @param username username
     */
    async findOneWithRolesAndPermissions(loginName: string): Promise<User> {
        const user = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.personalPermissions', 'userPersonalPermissions')
            .leftJoinAndSelect('userPersonalPermissions.permission', 'personalPermissions')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permissions', 'permissions')
            .where('user.username = :username', { username: loginName })
            .orWhere('user.mobile = :mobile', { mobile: loginName })
            .orWhere('user.email = :email', { email: loginName.toLocaleLowerCase() })
            .getOne();

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
            for (const user of users) {
                const infoItems = await infoItemQb.where('users.id = :id', { id: user.id }).orderBy('infoItem.order', 'ASC').getMany();
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
     * user login by username or email
     *
     * @param loginName loginName: username or email
     * @param password password
     */
    async login(loginName: string, password: string) {
        const user = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('user.organizations', 'organizations')
            .leftJoinAndSelect('user.userInfos', 'userInfos')
            .leftJoinAndSelect('userInfos.infoItem', 'infoItem')
            .where('user.username = :username', { username: loginName })
            .orWhere('user.mobile = :mobile', { mobile: loginName })
            .orWhere('user.email = :email', { email: loginName.toLocaleLowerCase() })
            .getOne();

        await this.checkUserStatus(user);
        if (!await this.cryptoUtil.checkPassword(password, user.password)) {
            throw new RpcException({ code: 406, message: t('invalid password') });
        }

        const infoItem = await this.infoItemRepo.createQueryBuilder('infoItem')
            .leftJoin('infoItem.infoGroups', 'infoGroups')
            .leftJoin('infoGroups.role', 'role')
            .leftJoin('role.users', 'users')
            .where('users.username = :username', { username: loginName })
            .orWhere('users.mobile = :mobile', { mobile: loginName })
            .orWhere('users.email = :email', { email: loginName.toLocaleLowerCase() })
            .orderBy('infoItem.order', 'ASC')
            .getMany();

        const userInfoData = this.refactorUserData(user, infoItem);

        const tokenInfo = await this.authService.createToken({ loginName });
        return { tokenInfo, userInfoData };
    }

    /**
     * Ordinary user registration
     *
     * @param createUserInput createUserInput
     */
    async register(createUserInput: CreateUserInput): Promise<void> {
        createUserInput.roleIds = [1];
        await this.createUser(createUserInput);
    }

    /**
     * Add a permission to user or delete a permission of user
     *
     * @param userId The specified user id
     * @param permissionId The specified permission id
     * @param status The operation status
     */
    private async addOrDeletePermissionForUser(userId: number, permissionId: number, status: 'increase' | 'decrease') {
        const user = await this.findOneById(userId);
        const permission = await this.permissionRepo.findOne(permissionId);
        if (!permission) throw new RpcException({ code: 404, message: t('The permission id of %s does not exist', permissionId.toString()) });

        const personalPermission = await this.personalPermissionRepo.find({ permission: { id: permissionId } });
        if (!!personalPermission.find(pp => pp.user.id === userId)) {
            throw new RpcException({ code: 409, message: t(`The permission has already been ${status === 'increase' ? 'added' : 'deleted'}`) });
        }

        if (status === 'decrease') {
            const user = await this.userRepo.findOne({ relations: ['roles', 'roles.permissions'] });
            const permission = <Permission[]>[].concat(...user.roles.map(role => role.permissions));
            if (!!!permission.find(p => p.id === permissionId)) {
                throw new RpcException({ code: 406, message: t(`Can not delete the permission which is not exist in this user's permissions`) });
            }
        }
        await this.personalPermissionRepo.save(this.personalPermissionRepo.create({ user, permission, status }));
    }

    /**
     * check if user is exist and user is banned or recycle
     *
     * @param user user
     */
    private checkUserStatus(user: User) {
        if (!user) throw new RpcException({ code: 404, message: t('User does not exist') });
        if (user.banned || user.recycle) throw new RpcException({ code: 400, message: t('User is banned') });
    }

    /**
     * Query users by ID
     *
     * @param id The specified user id
     */
    private async findOneById(id: number): Promise<User> {
        const exist = await this.userRepo.findOne(id);
        if (!exist) {
            throw new RpcException({ code: 404, message: t('User does not exist') });
        }
        return exist;
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
    private async createOrUpdateUserInfos(user: User, infoKVs: CreateUserInfoKVs[] | UpdateUserInfoKVs[], action: 'create' | 'update') {
        if (infoKVs.length) {
            if (action === 'create') {
                for (const infoKV of (infoKVs as CreateUserInfoKVs[])) {
                    const userInfo = this.userInfoRepo.create({ value: infoKV.userInfoValue, user, infoItem: { id: infoKV.infoItemId } });
                    await this.userInfoRepo.save(userInfo);
                }
                return;
            }

            for (const infoKV of (infoKVs as UpdateUserInfoKVs[])) {
                if (infoKV.userInfoId) {
                    await this.userInfoRepo.update(infoKV.userInfoId, { value: infoKV.userInfoValue });
                } else {
                    const userInfo = this.userInfoRepo.create({ value: infoKV.userInfoValue, user, infoItem: { id: infoKV.infoItemId } });
                    await this.userInfoRepo.save(userInfo);
                }
            }
        }
    }

    /**
     * Refactor the user information data
     *
     * @param user The user object
     */
    private refactorUserData(user: User, infoItems: InfoItem[]) {
        const userInfoData: UserInfoData = {
            id: user.id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            banned: user.banned,
            recycle: user.recycle,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            userRoles: user.roles,
            userOrganizations: user.organizations,
            userInfos: infoItems.length ? infoItems.map(infoItem => {
                const userInfo = user.userInfos.find(userInfo => userInfo.infoItem.id === infoItem.id);
                return {
                    id: user.userInfos.length ? (userInfo ? userInfo.id : undefined) : undefined,
                    order: infoItem.order,
                    infoItemId: infoItem.id,
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