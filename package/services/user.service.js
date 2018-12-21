"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const addon_sms_1 = require("@notadd/addon-sms");
const i18n_1 = require("i18n");
const typeorm_2 = require("typeorm");
const auth_service_1 = require("../auth/auth.service");
const info_item_entity_1 = require("../entities/info-item.entity");
const user_info_entity_1 = require("../entities/user-info.entity");
const user_entity_1 = require("../entities/user.entity");
const crypto_util_1 = require("../utils/crypto.util");
const role_service_1 = require("./role.service");
let UserService = class UserService {
    constructor(userRepo, userInfoRepo, infoItemRepo, cryptoUtil, authService, roleService, smsComponentProvider) {
        this.userRepo = userRepo;
        this.userInfoRepo = userInfoRepo;
        this.infoItemRepo = infoItemRepo;
        this.cryptoUtil = cryptoUtil;
        this.authService = authService;
        this.roleService = roleService;
        this.smsComponentProvider = smsComponentProvider;
    }
    async createUser(createUserInput) {
        if (!(createUserInput.username || createUserInput.mobile || createUserInput.email)) {
            throw new common_1.HttpException(i18n_1.__('Please make sure the username, mobile phone number, and email exist at least one'), 406);
        }
        if (createUserInput.username && await this.userRepo.findOne({ where: { username: createUserInput.username } })) {
            throw new common_1.HttpException(i18n_1.__('Username already exists'), 409);
        }
        if (createUserInput.mobile && await this.userRepo.findOne({ where: { mobile: createUserInput.mobile } })) {
            throw new common_1.HttpException(i18n_1.__('Mobile already exists'), 409);
        }
        if (createUserInput.email && await this.userRepo.findOne({ where: { email: createUserInput.email } })) {
            throw new common_1.HttpException(i18n_1.__('Email already exists'), 409);
        }
        createUserInput.password = await this.cryptoUtil.encryptPassword(createUserInput.password);
        if (createUserInput.email)
            createUserInput.email = createUserInput.email.toLocaleLowerCase();
        const user = await this.userRepo.save(this.userRepo.create(createUserInput));
        if (createUserInput.roleIds && createUserInput.roleIds.length) {
            await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(user).add(createUserInput.roleIds);
        }
        if (createUserInput.organizationIds && createUserInput.organizationIds.length) {
            await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'organizations').of(user).add(createUserInput.organizationIds);
        }
        if (createUserInput.infoKVs && createUserInput.infoKVs.length) {
            await this.createOrUpdateUserInfos(user, createUserInput.infoKVs, 'create');
        }
    }
    async addUserRole(userId, roleId) {
        await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(userId).add(roleId);
    }
    async deleteUserRole(userId, roleId) {
        await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(userId).remove(roleId);
    }
    async recycleOrBanUser(id, action) {
        const user = await this.findOneById(id);
        if (action === 'recycle') {
            user.recycle = true;
        }
        if (action === 'ban') {
            user.banned = true;
        }
        await this.userRepo.save(user);
    }
    async deleteUser(id) {
        const user = await this.userRepo.findOne(id, { relations: ['roles', 'organizations'] });
        await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(user).remove(user.roles);
        await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'organizations').of(user).remove(user.organizations);
        await this.userRepo.remove(user);
    }
    async revertBannedOrRecycledUser(id, status) {
        const user = await this.findOneById(id);
        if (status === 'recycled') {
            user.recycle = false;
        }
        if (status === 'banned') {
            user.banned = false;
        }
        await this.userRepo.save(user);
    }
    async updateUserInfo(id, updateUserInput) {
        const user = await this.userRepo.findOne(id, { relations: ['userInfos'] });
        if (updateUserInput.username && updateUserInput.username !== user.username) {
            if (await this.userRepo.findOne({ where: { username: updateUserInput.username } })) {
                throw new common_1.HttpException(i18n_1.__('Username already exists'), 409);
            }
            await this.userRepo.update(user.id, { username: updateUserInput.username });
        }
        if (updateUserInput.mobile && updateUserInput.mobile !== user.mobile) {
            if (await this.userRepo.findOne({ where: { mobile: updateUserInput.mobile } })) {
                throw new common_1.HttpException(i18n_1.__('Mobile already exists'), 409);
            }
            await this.userRepo.update(user.id, { mobile: updateUserInput.mobile });
        }
        if (updateUserInput.email && updateUserInput.email !== user.email) {
            if (await this.userRepo.findOne({ where: { email: updateUserInput.email } })) {
                throw new common_1.HttpException(i18n_1.__('Email already exists'), 409);
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
        if (updateUserInput.roleIds && updateUserInput.roleIds.length) {
            updateUserInput.roleIds.forEach(async (roleId) => {
                await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(user).remove(roleId.before);
                await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'roles').of(user).add(roleId.after);
            });
        }
        if (updateUserInput.organizationIds && updateUserInput.organizationIds.length) {
            updateUserInput.organizationIds.forEach(async (organizationId) => {
                await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'organizations').of(user).remove(organizationId.before);
                await this.userRepo.createQueryBuilder('user').relation(user_entity_1.User, 'organizations').of(user).add(organizationId.after);
            });
        }
        if (updateUserInput.infoKVs && updateUserInput.infoKVs.length) {
            await this.createOrUpdateUserInfos(user, updateUserInput.infoKVs, 'update');
        }
    }
    async findAllUsers(pageNumber, pageSize) {
        if (pageNumber && pageSize) {
            const usersAndCount = await this.userRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
            const usersInfo = await this.findUserInfoById(usersAndCount[0].map(u => u.id));
            return { count: usersAndCount[1], usersInfo };
        }
        const users = await this.userRepo.find();
        return this.findUserInfoById(users.map(u => u.id));
    }
    async findByRoleId(roleId, pageNumber, pageSize) {
        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('roles.id = :roleId', { roleId })
            .andWhere('user.recycle = false');
        let users;
        let count;
        if (pageNumber && pageSize) {
            const usersAndCount = await qb.skip((pageNumber - 1) * pageSize).take(pageSize).getManyAndCount();
            users = usersAndCount[0];
            count = usersAndCount[1];
        }
        else {
            users = await qb.getMany();
        }
        if (!users.length) {
            throw new common_1.HttpException(i18n_1.__('No users belong to this role'), 404);
        }
        const usersInfo = await this.findUserInfoById(users.map(user => user.id));
        return { usersInfo, count };
    }
    async findByOrganizationId(organizationId, pageNumber, pageSize) {
        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.organizations', 'organizations')
            .where('organizations.id = :organizationId', { organizationId })
            .andWhere('user.recycle = false');
        let users;
        let count;
        if (pageNumber && pageSize) {
            const usersAndCount = await qb.skip((pageNumber - 1) * pageSize).take(pageSize).getManyAndCount();
            users = usersAndCount[0];
            count = usersAndCount[1];
        }
        else {
            users = await qb.getMany();
        }
        if (!users.length) {
            throw new common_1.HttpException(i18n_1.__('No users belong to this organization'), 404);
        }
        const usersInfo = await this.findUserInfoById(users.map(user => user.id));
        return { usersInfo, count };
    }
    async findOneWithRolesAndPermissions(loginName) {
        const user = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permissions', 'permissions')
            .where('user.username = :loginName', { loginName })
            .orWhere('user.mobile = :loginName', { loginName })
            .orWhere('user.email = :loginName', { loginName: loginName.toLocaleLowerCase() })
            .getOne();
        if (!user) {
            throw new common_1.HttpException(i18n_1.__('User does not exist'), 404);
        }
        return user;
    }
    async findUserInfoById(id) {
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
            const userInfoData = [];
            const users = await userQb.whereInIds(id).getMany();
            const infoItems = await infoItemQb.where('users.id IN (:...id)', { id }).orderBy('infoItem.order', 'ASC').getMany();
            for (const user of users) {
                userInfoData.push(this.refactorUserData(user, infoItems));
            }
            return userInfoData;
        }
        else {
            const user = await userQb.where('user.id = :id', { id }).getOne();
            const infoItem = await infoItemQb.where('users.id = :id', { id }).orderBy('infoItem.order', 'ASC').getMany();
            return this.refactorUserData(user, infoItem);
        }
    }
    async findOneWithInfoItemsByRoleIds(roleIds) {
        return this.roleService.findInfoGroupItemsByIds(roleIds);
    }
    async login(loginName, password) {
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
            throw new common_1.HttpException(i18n_1.__('invalid password'), 406);
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
    async mobileLogin(mobile, validationCode) {
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
    async register(createUserInput) {
        createUserInput.roleIds = [1];
        await this.createUser(createUserInput);
    }
    checkUserStatus(user) {
        if (!user)
            throw new common_1.HttpException(i18n_1.__('User does not exist'), 404);
        if (user.banned || user.recycle)
            throw new common_1.HttpException(i18n_1.__('User is banned'), 400);
    }
    async findOneById(id) {
        const exist = this.userRepo.findOne(id);
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('User does not exist'), 404);
        }
        return exist;
    }
    async createOrUpdateUserInfos(user, infoKVs, action) {
        if (infoKVs.length) {
            if (action === 'create') {
                infoKVs.forEach(async (infoKV) => {
                    await this.userInfoRepo.save(this.userInfoRepo.create({ value: infoKV.value, user, infoItem: { id: infoKV.key } }));
                });
                return;
            }
            infoKVs.forEach(async (infoKV) => {
                if (infoKV.key) {
                    await this.userInfoRepo.update(infoKV.key, { value: infoKV.value });
                }
                else {
                    await this.userInfoRepo.save(this.userInfoRepo.create({ value: infoKV.value, user, infoItem: { id: infoKV.relationId } }));
                }
            });
        }
    }
    refactorUserData(user, infoItems) {
        const userInfoData = {
            userId: user.id,
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
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(user_entity_1.User)),
    __param(1, typeorm_1.InjectRepository(user_info_entity_1.UserInfo)),
    __param(2, typeorm_1.InjectRepository(info_item_entity_1.InfoItem)),
    __param(3, common_1.Inject(crypto_util_1.CryptoUtil)),
    __param(4, common_1.Inject(common_1.forwardRef(() => auth_service_1.AuthService))),
    __param(5, common_1.Inject(role_service_1.RoleService)),
    __param(6, common_1.Inject('SmsComponentToken')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        crypto_util_1.CryptoUtil,
        auth_service_1.AuthService,
        role_service_1.RoleService,
        addon_sms_1.SmsComponent])
], UserService);
exports.UserService = UserService;
