import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SmsComponent } from '@notadd/addon-sms';
import { __ as t } from 'i18n';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { InfoItem } from '../entities/info-item.entity';
import { UserInfo } from '../entities/user-info.entity';
import { User } from '../entities/user.entity';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserInfo) private readonly userInfoRepo: Repository<UserInfo>,
        @InjectRepository(InfoItem) private readonly infoItemRepo: Repository<InfoItem>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
        @Inject(RoleService) private readonly roleService: RoleService,
        @Inject('SmsComponentToken') private readonly smsComponentProvider: SmsComponent
    ) { }

    /**
     * Cteate a user
     *
     * @param user The user object
     */
    async createUser(createUserInput: CreateUserInput): Promise<void> {
        if (!(createUserInput.username || createUserInput.mobile || createUserInput.email)) {
            throw new HttpException(t('Please make sure the username, mobile phone number, and email exist at least one'), 406);
        }
        if (createUserInput.username && await this.userRepo.findOne({ where: { username: createUserInput.username } })) {
            throw new HttpException(t('Username already exists'), 409);
        }
        if (createUserInput.mobile && await this.userRepo.findOne({ where: { mobile: createUserInput.mobile } })) {
            throw new HttpException(t('Mobile already exists'), 409);
        }
        if (createUserInput.email && await this.userRepo.findOne({ where: { email: createUserInput.email } })) {
            throw new HttpException(t('Email already exists'), 409);
        }

        createUserInput.password = await this.cryptoUtil.encryptPassword(createUserInput.password);
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

        if (updateUserInput.username) {
            if (await this.userRepo.findOne({ where: { username: updateUserInput.username } })) {
                throw new HttpException(t('Username already exists'), 409);
            }
            await this.userRepo.update(user.id, { username: updateUserInput.username });
        }
        if (updateUserInput.mobile) {
            if (await this.userRepo.findOne({ where: { mobile: updateUserInput.mobile } })) {
                throw new HttpException(t('Mobile already exists'), 409);
            }
            await this.userRepo.update(user.id, { mobile: updateUserInput.mobile });
        }
        if (updateUserInput.email) {
            if (await this.userRepo.findOne({ where: { email: updateUserInput.email } })) {
                throw new HttpException(t('Email already exists'), 409);
            }
            await this.userRepo.update(user.id, { email: updateUserInput.email.toLocaleLowerCase() });
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
        const users = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('roles.id = :roleId', { roleId })
            .andWhere('user.recycle = false')
            .getMany();
        if (!users.length) {
            throw new HttpException(t('No users belong to this role'), 404);
        }
        return this.findUserInfoById(users.map(user => user.id)) as Promise<UserInfoData[]>;
    }

    /**
     * Query users that belongs to the organization
     *
     * @param id The specified organization id
     */
    async findByOrganizationId(organizationId: number): Promise<UserInfoData[]> {
        const users = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.organizations', 'organizations')
            .where('organizations.id = :organizationId', { organizationId })
            .andWhere('user.recycle = false')
            .getMany();
        if (!users.length) {
            throw new HttpException(t('No users belong to this organization'), 404);
        }
        return this.findUserInfoById(users.map(user => user.id)) as Promise<UserInfoData[]>;
    }

    /**
     * Querying users and their associated information by username
     *
     * @param username username
     */
    async findOneWithRolesAndPermissions(loginName: string): Promise<User> {
        const user = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permissions', 'permissions')
            .where('user.username = :loginName', { loginName })
            .orWhere('user.mobile = :loginName', { loginName })
            .orWhere('user.email = :loginName', { loginName: loginName.toLocaleLowerCase() })
            .getOne();

        if (!user) {
            throw new HttpException(t('User does not exist'), 404);
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
            .where('user.username = :loginName', { loginName })
            .orWhere('user.mobile = :loginName', { loginName })
            .orWhere('user.email = :loginName', { loginName: loginName.toLocaleLowerCase() })
            .getOne();

        await this.checkUserStatus(user);
        if (!await this.cryptoUtil.checkPassword(password, user.password)) {
            throw new HttpException(t('invalid password'), 406);
        }

        const infoItem = await this.infoItemRepo.createQueryBuilder('infoItem')
            .leftJoin('infoItem.infoGroups', 'infoGroups')
            .leftJoin('infoGroups.role', 'role')
            .leftJoin('role.users', 'users')
            .where('users.username = :loginName', { loginName })
            .orWhere('users.mobile = :loginName', { loginName })
            .orWhere('users.email = :loginName', { loginName: loginName.toLocaleLowerCase() })
            .orderBy('infoItem.order', 'ASC')
            .getMany();

        const userInfoData = this.refactorUserData(user, infoItem);

        const tokenInfo = await this.authService.createToken({ loginName });
        return { tokenInfo, userInfoData };
    }

    /**
     * user login by mobile (use tencent cloud sms service)
     *
     * @param mobile mobile
     * @param validationCode validationCode
     */
    async mobileLogin(mobile: string, validationCode: number) {
        await this.smsComponentProvider.smsValidator(mobile, validationCode);

        const user = await this.userRepo.findOne({ mobile }, { relations: ['roles', 'organizations', 'userInfos', 'userInfos.infoItem'] });
        await this.checkUserStatus(user);

        const infoItem = await this.infoItemRepo.createQueryBuilder('infoItem')
            .leftJoin('infoItem.infoGroups', 'infoGroups')
            .leftJoin('infoGroups.role', 'role')
            .leftJoin('role.users', 'users')
            .where('users.mobile = :mobile', { mobile })
            .orderBy('infoItem.order', 'ASC')
            .getMany();

        const userInfoData = this.refactorUserData(user, infoItem);

        const tokenInfo = await this.authService.createToken({ loginName: mobile });
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

    private checkUserStatus(user: User) {
        if (!user) throw new HttpException(t('User does not exist'), 404);
        if (user.banned || user.recycle) throw new HttpException(t('User is banned'), 400);
    }

    /**
     * Query users by ID
     *
     * @param id The specified user id
     */
    private async findOneById(id: number): Promise<User> {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new HttpException(t('User does not exist'), 404);
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
                    this.userInfoRepo.update(infoKV.key, { value: infoKV.value });
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