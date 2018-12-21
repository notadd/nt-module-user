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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@nestjs/graphql");
const i18n_1 = require("i18n");
const decorators_1 = require("../decorators");
const role_service_1 = require("./../services/role.service");
let RoleResolver = class RoleResolver {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async createRole(req, body) {
        await this.roleService.createRole(body.name);
        return { code: 200, message: i18n_1.__('Create a role successfully') };
    }
    async deleteRole(req, body) {
        await this.roleService.deleteRole(body.id);
        return { code: 200, message: i18n_1.__('Delete role successfully') };
    }
    async updateRole(req, body) {
        await this.roleService.updateRole(body.id, body.name);
        return { code: 200, message: i18n_1.__('Update role successfully') };
    }
    async removePermissionOfRole(req, body) {
        await this.roleService.removePermission(body.roleId, body.permissionId);
        return { code: 200, message: i18n_1.__('Remove permission of role successfully') };
    }
    async setPermissionsToRole(req, body) {
        await this.roleService.setPermissions(body.roleId, body.permissionIds);
        return { code: 200, message: i18n_1.__('Set role permissions successfully') };
    }
    async findRoles(req, body) {
        const result = await this.roleService.findRoles(body.pageNumber, body.pageSize);
        let data;
        let count;
        if (typeof result[1] === 'number') {
            data = result[0];
            count = result[1];
        }
        else {
            data = result;
        }
        return { code: 200, message: i18n_1.__('Query all roles successfully'), data, count };
    }
    async findOneRoleInfo(req, body) {
        const data = await this.roleService.findOneRoleInfo(body.roleId);
        return { code: 200, message: i18n_1.__('Query role information successfully'), data };
    }
};
__decorate([
    graphql_1.Mutation('createRole'),
    decorators_1.Permission({ name: 'create_role', identify: 'role:createRole', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "createRole", null);
__decorate([
    graphql_1.Mutation('deleteRole'),
    decorators_1.Permission({ name: 'delete_role', identify: 'role:deleteRole', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "deleteRole", null);
__decorate([
    graphql_1.Mutation('updateRole'),
    decorators_1.Permission({ name: 'update_role', identify: 'role:updateRole', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "updateRole", null);
__decorate([
    graphql_1.Mutation('removePermissionOfRole'),
    decorators_1.Permission({ name: 'remove_permission_of_role', identify: 'role:removePermissionOfRole', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "removePermissionOfRole", null);
__decorate([
    graphql_1.Mutation('setPermissionsToRole'),
    decorators_1.Permission({ name: 'set_permissions_to_role', identify: 'role:setPermissionsToRole', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "setPermissionsToRole", null);
__decorate([
    graphql_1.Query('findRoles'),
    decorators_1.Permission({ name: 'find_roles', identify: 'role:findRoles', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "findRoles", null);
__decorate([
    graphql_1.Query('findOneRoleInfo'),
    decorators_1.Permission({ name: 'find_one_role_info', identify: 'role:findOneRoleInfo', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "findOneRoleInfo", null);
RoleResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'role_manage', identify: 'role:manage' }),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleResolver);
exports.RoleResolver = RoleResolver;
