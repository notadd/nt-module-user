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
const info_group_service_1 = require("../services/info-group.service");
let InfoGroupResolver = class InfoGroupResolver {
    constructor(infoGroupService) {
        this.infoGroupService = infoGroupService;
    }
    async createInfoGroup(req, body) {
        await this.infoGroupService.create(body.name, body.roleId);
        return { code: 200, message: i18n_1.__('Create a information group successfully') };
    }
    async deleteInfoGroup(req, body) {
        await this.infoGroupService.delete(body.groupId);
        return { code: 200, message: i18n_1.__('Deleted the information group successfully') };
    }
    async updateInfoGroup(req, body) {
        await this.infoGroupService.update(body.groupId, body.name, body.roleId);
        return { code: 200, message: i18n_1.__('Update the information group successfully') };
    }
    async addInfoItemToInfoGroup(req, body) {
        await this.infoGroupService.addInfoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: i18n_1.__('Add an information item to the information group successfully') };
    }
    async deleteIntoItemFromInfoGroup(req, body) {
        await this.infoGroupService.deleteIntoItem(body.infoGroupId, body.infoItemIds);
        return { code: 200, message: i18n_1.__('Delete the information item in the information group successfully') };
    }
    async findAllInfoGroup() {
        const data = await this.infoGroupService.findAll();
        return { code: 200, message: i18n_1.__('Query all information groups successfully'), data };
    }
    async findInfoItemsByGroupId(req, body) {
        const data = await this.infoGroupService.findItemsById(body.groupId);
        return { code: 200, message: i18n_1.__('Query the information item in the information group successfully'), data };
    }
};
__decorate([
    graphql_1.Mutation('createInfoGroup'),
    decorators_1.Permission({ name: 'create_info_group', identify: 'infoGroup:createInfoGroup', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "createInfoGroup", null);
__decorate([
    graphql_1.Mutation('deleteInfoGroup'),
    decorators_1.Permission({ name: 'delete_info_group', identify: 'infoGroup:deleteInfoGroup', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "deleteInfoGroup", null);
__decorate([
    graphql_1.Mutation('updateInfoGroup'),
    decorators_1.Permission({ name: 'update_info_group', identify: 'infoGroup:updateInfoGroup', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "updateInfoGroup", null);
__decorate([
    graphql_1.Mutation('addInfoItemToInfoGroup'),
    decorators_1.Permission({ name: 'add_info_item_to_info_group', identify: 'infoGroup:addInfoItemToInfoGroup', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "addInfoItemToInfoGroup", null);
__decorate([
    graphql_1.Mutation('deleteIntoItemFromInfoGroup'),
    decorators_1.Permission({ name: 'delete_into_item_from_info_group', identify: 'infoGroup:deleteIntoItemFromInfoGroup', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "deleteIntoItemFromInfoGroup", null);
__decorate([
    graphql_1.Query('findAllInfoGroup'),
    decorators_1.Permission({ name: 'find_all_info_group', identify: 'infoGroup:findAllInfoGroup', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "findAllInfoGroup", null);
__decorate([
    graphql_1.Query('findInfoItemsByGroupId'),
    decorators_1.Permission({ name: 'find_info_items_by_group_id', identify: 'infoGroup:findInfoItemsByGroupId', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoGroupResolver.prototype, "findInfoItemsByGroupId", null);
InfoGroupResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'info_group_manage', identify: 'infoGroup:manage' }),
    __param(0, common_1.Inject(info_group_service_1.InfoGroupService)),
    __metadata("design:paramtypes", [info_group_service_1.InfoGroupService])
], InfoGroupResolver);
exports.InfoGroupResolver = InfoGroupResolver;

//# sourceMappingURL=info-group.resolver.js.map
