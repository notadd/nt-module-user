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
const organization_service_1 = require("./../services/organization.service");
let OrganizationResolver = class OrganizationResolver {
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async findRootOrganizations() {
        const data = await this.organizationService.findRoots();
        return { code: 200, message: i18n_1.__('Get the root organization successfully'), data };
    }
    async findAllOrganizations() {
        const data = await this.organizationService.findAllTrees();
        return { code: 200, message: i18n_1.__('Get all organizations successful'), data };
    }
    async findChildrenOrganizations(req, body) {
        const data = await this.organizationService.findChildren(body.id);
        return { code: 200, message: i18n_1.__('Get all sub-organizations below the organization successfully'), data };
    }
    async createOrganization(req, body) {
        await this.organizationService.createOrganization(body.name, body.parentId);
        return { code: 200, message: i18n_1.__('Create an organizational successfully') };
    }
    async updateOrganization(req, body) {
        await this.organizationService.updateOrganization(body.id, body.name, body.parentId);
        return { code: 200, message: i18n_1.__('Update organization successfully') };
    }
    async deleteOrganization(req, body) {
        await this.organizationService.deleteOrganization(body.id);
        return { code: 200, message: i18n_1.__('Delete organization successfully"') };
    }
    async addUsersToOrganization(req, body) {
        await this.organizationService.addUsersToOrganization(body.id, body.userIds);
        return { code: 200, message: i18n_1.__('Add users to your organization successfully') };
    }
    async deleteUserFromOrganization(req, body) {
        await this.organizationService.deleteUserFromOrganization(body.id, body.userIds);
        return { code: 200, message: i18n_1.__('Delete users from your organization successfully') };
    }
};
__decorate([
    graphql_1.Query('findRootOrganizations'),
    decorators_1.Permission({ name: 'find_root_organizations', identify: 'organization:findRootOrganizations', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "findRootOrganizations", null);
__decorate([
    graphql_1.Query('findAllOrganizations'),
    decorators_1.Permission({ name: 'find_all_organizations', identify: 'organization:findAllOrganizations', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "findAllOrganizations", null);
__decorate([
    graphql_1.Query('findChildrenOrganizations'),
    decorators_1.Permission({ name: 'find_children_organizations', identify: 'organization:findChildrenOrganizations', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "findChildrenOrganizations", null);
__decorate([
    graphql_1.Mutation('createOrganization'),
    decorators_1.Permission({ name: 'create_organization', identify: 'organization:createOrganization', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "createOrganization", null);
__decorate([
    graphql_1.Mutation('updateOrganization'),
    decorators_1.Permission({ name: 'update_organization', identify: 'organization:updateOrganization', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "updateOrganization", null);
__decorate([
    graphql_1.Mutation('deleteOrganization'),
    decorators_1.Permission({ name: 'delete_organization', identify: 'organization:deleteOrganization', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "deleteOrganization", null);
__decorate([
    graphql_1.Mutation('addUsersToOrganization'),
    decorators_1.Permission({ name: 'add_users_to_organization', identify: 'organization:addUsersToOrganization', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "addUsersToOrganization", null);
__decorate([
    graphql_1.Mutation('deleteUserFromOrganization'),
    decorators_1.Permission({ name: 'delete_user_from_organization', identify: 'organization:deleteUserFromOrganization', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrganizationResolver.prototype, "deleteUserFromOrganization", null);
OrganizationResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'organization_manage', identify: 'organization:manage' }),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationResolver);
exports.OrganizationResolver = OrganizationResolver;

//# sourceMappingURL=organization.resolver.js.map
