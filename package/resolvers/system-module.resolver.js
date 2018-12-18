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
const system_module_service_1 = require("../services/system-module.service");
let SystemModuleResolver = class SystemModuleResolver {
    constructor(systemModuleService) {
        this.systemModuleService = systemModuleService;
    }
    async findSystemModules() {
        const data = await this.systemModuleService.findSystemModules();
        return { code: 200, message: i18n_1.__('Query the system modules successfully'), data };
    }
};
__decorate([
    graphql_1.Query('findSystemModules'),
    decorators_1.Permission({ name: 'find_system_modules', identify: 'systemModule:findSystemModules', action: 'find' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemModuleResolver.prototype, "findSystemModules", null);
SystemModuleResolver = __decorate([
    graphql_1.Resolver(),
    decorators_1.Resource({ name: 'system_module_manage', identify: 'systemModule:manage' }),
    __param(0, common_1.Inject(system_module_service_1.SystemModuleService)),
    __metadata("design:paramtypes", [system_module_service_1.SystemModuleService])
], SystemModuleResolver);
exports.SystemModuleResolver = SystemModuleResolver;
