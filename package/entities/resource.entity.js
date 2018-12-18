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
const typeorm_1 = require("typeorm");
const permission_entity_1 = require("./permission.entity");
const system_module_entity_1 = require("./system-module.entity");
let Resource = class Resource {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Resource.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Resource.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        unique: true
    }),
    __metadata("design:type", String)
], Resource.prototype, "identify", void 0);
__decorate([
    typeorm_1.OneToMany(type => permission_entity_1.Permission, permission => permission.resource),
    __metadata("design:type", Array)
], Resource.prototype, "permissions", void 0);
__decorate([
    typeorm_1.ManyToOne(type => system_module_entity_1.SystemModule, systemModule => systemModule.resources, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", system_module_entity_1.SystemModule)
], Resource.prototype, "systemModule", void 0);
Resource = __decorate([
    typeorm_1.Entity('resource')
], Resource);
exports.Resource = Resource;
