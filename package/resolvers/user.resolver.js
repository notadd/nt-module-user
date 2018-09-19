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
const graphql_1 = require("@nestjs/graphql");
const i18n_1 = require("i18n");
const decorators_1 = require("../decorators");
const user_service_1 = require("../services/user.service");
let UserResolver = class UserResolver {
    constructor(userService) {
        this.userService = userService;
    }
    async login(req, body) {
        let data;
        if (!parseInt(body.password)) {
            data = await this.userService.login(body.username, body.password);
        }
        else if (parseInt(body.password)) {
            data = await this.userService.mobileLogin(body.username, parseInt(body.password));
        }
        return { code: 200, message: i18n_1.__('Login success'), data: data.tokenInfo };
    }
    async adminLogin(req, body) {
        let data;
        if (!parseInt(body.password)) {
            data = await this.userService.login(body.username, body.password);
        }
        else if (parseInt(body.password)) {
            data = await this.userService.mobileLogin(body.username, parseInt(body.password));
        }
        const userInfoData = data.userInfoData;
        if (userInfoData.username !== 'sadmin' && userInfoData.userRoles.map(v => v.id).includes(1)) {
            throw new common_1.HttpException(i18n_1.__('You are not authorized to access'), 401);
        }
        return { code: 200, message: i18n_1.__('Login success'), data: data.tokenInfo };
    }
    async register(req, body) {
        await this.userService.register(body.registerUserInput);
        return { code: 200, message: i18n_1.__('Registration success') };
    }
    async createUser(req, body) {
        await this.userService.createUser(body.createUserInput);
        return { code: 200, message: i18n_1.__('Create user successfully') };
    }
    async addUserRole(req, body) {
        await this.userService.addUserRole(body.userId, body.roleId);
        return { code: 200, message: i18n_1.__('Add user role successfully') };
    }
    async deleteUserRole(req, body) {
        await this.userService.deleteUserRole(body.userId, body.roleId);
        return { code: 200, message: i18n_1.__('Delete user role successfully') };
    }
    async banUser(req, body) {
        await this.userService.recycleOrBanUser(body.userId, 'recycle');
        return { code: 200, message: i18n_1.__('Ban user successfully') };
    }
    async recycleUser(req, body) {
        await this.userService.recycleOrBanUser(body.userId, 'recycle');
        return { code: 200, message: i18n_1.__('Delete user to recycle bin successfully') };
    }
    async deleteRecycledUser(req, body) {
        await this.userService.deleteUser(body.userId);
        return { code: 200, message: i18n_1.__('Delete user in the recycle bin successfully') };
    }
    async revertBannedUser(req, body) {
        await this.userService.revertBannedOrRecycledUser(body.userId, 'banned');
        return { code: 200, message: i18n_1.__('Revert banned user successfully') };
    }
    async revertRecycledUser(req, body) {
        await this.userService.revertBannedOrRecycledUser(body.userId, 'recycled');
        return { code: 200, message: i18n_1.__('Revert recycled user successfully') };
    }
    async updateUserInfo(req, body) {
        await this.userService.updateUserInfo(body.userId, body.updateUserInput);
        return { code: 200, message: i18n_1.__('Update user information successfully') };
    }
    async updateCurrentUserInfo(req, body, context) {
        await this.userService.updateUserInfo(context.user.id, body.updateCurrentUserInput);
        return { code: 200, message: i18n_1.__('Update current login user information successfully') };
    }
    async findUserInfoById(req, body) {
        const data = await this.userService.findUserInfoById(body.userIds);
        return { code: 200, message: i18n_1.__('Query the specified users information successfully'), data };
    }
    async findCurrentUserInfo(req, body, context) {
        const data = await this.userService.findUserInfoById(context.user.id);
        return { code: 200, message: i18n_1.__('Query the current login user information successfully'), data };
    }
    async findRegisterUserInputInfo() {
        const data = await this.userService.findOneWithInfoItemsByRoleIds([1]);
        return { code: 200, message: i18n_1.__('Query user registration information item successfully'), data };
    }
    async findUsersInRole(req, body) {
        const data = await this.userService.findByRoleId(body.roleId);
        return { code: 200, message: i18n_1.__('Query the user under the role successfully'), data };
    }
    async findUsersInOrganization(req, body) {
        const data = await this.userService.findByOrganizationId(body.organizationId);
        return { code: 200, message: i18n_1.__('Query users under the organization successfully'), data };
    }
};
__decorate([
    graphql_1.Query('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    graphql_1.Query('adminLogin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "adminLogin", null);
__decorate([
    graphql_1.Mutation('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    graphql_1.Mutation('createUser'),
    decorators_1.Permission({ name: 'create_user', identify: 'user:createUser', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    graphql_1.Mutation('addUserRole'),
    decorators_1.Permission({ name: 'add_user_role', identify: 'user:addUserRole', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addUserRole", null);
__decorate([
    graphql_1.Mutation('deleteUserRole'),
    decorators_1.Permission({ name: 'delete_user_role', identify: 'user:deleteUserRole', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUserRole", null);
__decorate([
    graphql_1.Mutation('banUser'),
    decorators_1.Permission({ name: 'ban_user', identify: 'user:banUser', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "banUser", null);
__decorate([
    graphql_1.Mutation('recycleUser'),
    decorators_1.Permission({ name: 'recycle_user', identify: 'user:recycleUser', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "recycleUser", null);
__decorate([
    graphql_1.Mutation('deleteRecycledUser'),
    decorators_1.Permission({ name: 'delete_recycled_user', identify: 'user:deleteRecycledUser', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteRecycledUser", null);
__decorate([
    graphql_1.Mutation('revertBannedUser'),
    decorators_1.Permission({ name: 'revert_banned_user', identify: 'user:revertBannedUser', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "revertBannedUser", null);
__decorate([
    graphql_1.Mutation('revertRecycledUser'),
    decorators_1.Permission({ name: 'revert_recycled_user', identify: 'user:revertRecycledUser', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "revertRecycledUser", null);
__decorate([
    graphql_1.Mutation('updateUserInfoById'),
    decorators_1.Permission({ name: 'update_user_info_by_id', identify: 'user:updateUserInfoById', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUserInfo", null);
__decorate([
    graphql_1.Mutation('updateCurrentUserInfo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateCurrentUserInfo", null);
__decorate([
    graphql_1.Query('findUserInfoByIds'),
    decorators_1.Permission({ name: 'find_user_info_by_ids', identify: 'user:findUserInfoByIds', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findUserInfoById", null);
__decorate([
    graphql_1.Query('findCurrentUserInfo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findCurrentUserInfo", null);
__decorate([
    graphql_1.Query('findRegisterUserInfoItem'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findRegisterUserInputInfo", null);
__decorate([
    graphql_1.Query('findUsersInRole'),
    decorators_1.Permission({ name: 'find_users_in_role', identify: 'user:findUsersInRole', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findUsersInRole", null);
__decorate([
    graphql_1.Query('findUsersInOrganization'),
    decorators_1.Permission({ name: 'find_users_in_organization', identify: 'user:findUsersInOrganization', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findUsersInOrganization", null);
UserResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'user_manage', identify: 'user:manage' }),
    __param(0, common_1.Inject(user_service_1.UserService)),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserResolver);
exports.UserResolver = UserResolver;

//# sourceMappingURL=user.resolver.js.map
