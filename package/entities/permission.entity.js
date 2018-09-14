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
const resource_entity_1 = require("./resource.entity");
const role_entity_1 = require("./role.entity");
let Permission = class Permission {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Permission.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToOne(type => resource_entity_1.Resource, resource => resource.permissions, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", resource_entity_1.Resource)
], Permission.prototype, "resource", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Permission.prototype, "action", void 0);
__decorate([
    typeorm_1.Column({
        unique: true
    }),
    __metadata("design:type", String)
], Permission.prototype, "identify", void 0);
__decorate([
    typeorm_1.ManyToMany(type => role_entity_1.Role, role => role.permissions),
    __metadata("design:type", Array)
], Permission.prototype, "roles", void 0);
Permission = __decorate([
    typeorm_1.Entity('permission')
], Permission);
exports.Permission = Permission;

//# sourceMappingURL=permission.entity.js.map
