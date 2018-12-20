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
const resource_service_1 = require("../services/resource.service");
let ResourceResolver = class ResourceResolver {
    constructor(resourceService) {
        this.resourceService = resourceService;
    }
    async findResources(req, body) {
        const result = await this.resourceService.findResources(body.systemModuleId, body.pageNumber, body.pageSize);
        let data;
        let count;
        if (typeof result[1] === 'number') {
            data = result[0];
            count = result[1];
        }
        else {
            data = result;
        }
        return { code: 200, message: i18n_1.__('Query the resource successfully'), data, count };
    }
};
__decorate([
    graphql_1.Query('findResources'),
    decorators_1.Permission({ name: 'find_resources', identify: 'resource:findResources', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResourceResolver.prototype, "findResources", null);
ResourceResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'resource_manage', identify: 'resource:manage' }),
    __metadata("design:paramtypes", [resource_service_1.ResourceService])
], ResourceResolver);
exports.ResourceResolver = ResourceResolver;
