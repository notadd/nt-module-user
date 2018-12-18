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
const info_item_entity_1 = require("./info-item.entity");
const role_entity_1 = require("./role.entity");
let InfoGroup = class InfoGroup {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], InfoGroup.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        unique: true
    }),
    __metadata("design:type", String)
], InfoGroup.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToMany(type => info_item_entity_1.InfoItem, InfoItem => InfoItem.infoGroups),
    __metadata("design:type", Array)
], InfoGroup.prototype, "infoItems", void 0);
__decorate([
    typeorm_1.OneToOne(type => role_entity_1.Role, role => role.infoGroup, {
        onDelete: 'CASCADE'
    }),
    typeorm_1.JoinColumn(),
    __metadata("design:type", role_entity_1.Role)
], InfoGroup.prototype, "role", void 0);
InfoGroup = __decorate([
    typeorm_1.Entity('info_gourp')
], InfoGroup);
exports.InfoGroup = InfoGroup;
