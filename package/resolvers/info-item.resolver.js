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
const info_item_service_1 = require("../services/info-item.service");
let InfoItemResolver = class InfoItemResolver {
    constructor(infoItemService) {
        this.infoItemService = infoItemService;
    }
    async createInfoItem(req, body) {
        await this.infoItemService.create(body.infoItemInput);
        return { code: 200, message: i18n_1.__('Create information item successfully') };
    }
    async deleteInfoItem(req, body) {
        await this.infoItemService.delete(body.infoItemId);
        return { code: 200, message: i18n_1.__('Delete information item successfully') };
    }
    async updateInfoItem(req, body) {
        await this.infoItemService.update(body.updateInfoItemInput);
        return { code: 200, message: i18n_1.__('Update information item successfully') };
    }
    async findAllInfoItem() {
        const data = await this.infoItemService.findAll();
        return { code: 200, message: i18n_1.__('Query all information items successfully'), data };
    }
};
__decorate([
    graphql_1.Mutation('createInfoItem'),
    decorators_1.Permission({ name: 'create_info_item', identify: 'infoItem:createInfoItem', action: 'create' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoItemResolver.prototype, "createInfoItem", null);
__decorate([
    graphql_1.Mutation('deleteInfoItem'),
    decorators_1.Permission({ name: 'delete_info_item', identify: 'infoItem:deleteInfoItem', action: 'delete' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoItemResolver.prototype, "deleteInfoItem", null);
__decorate([
    graphql_1.Mutation('updateInfoItem'),
    decorators_1.Permission({ name: 'update_info_item', identify: 'infoItem:updateInfoItem', action: 'update' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InfoItemResolver.prototype, "updateInfoItem", null);
__decorate([
    graphql_1.Query('findAllInfoItem'),
    decorators_1.Permission({ name: 'find_all_info_item', identify: 'infoItem:findAllInfoItem', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InfoItemResolver.prototype, "findAllInfoItem", null);
InfoItemResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'info_item_manage', identify: 'infoItem:manage' }),
    __param(0, common_1.Inject(info_item_service_1.InfoItemService)),
    __metadata("design:paramtypes", [info_item_service_1.InfoItemService])
], InfoItemResolver);
exports.InfoItemResolver = InfoItemResolver;
