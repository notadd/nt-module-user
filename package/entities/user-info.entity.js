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
const user_entity_1 = require("./user.entity");
let UserInfo = class UserInfo {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserInfo.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], UserInfo.prototype, "value", void 0);
__decorate([
    typeorm_1.ManyToOne(type => user_entity_1.User, user => user.userInfos, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", user_entity_1.User)
], UserInfo.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => info_item_entity_1.InfoItem, infoItem => infoItem.userInfos, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", info_item_entity_1.InfoItem)
], UserInfo.prototype, "infoItem", void 0);
UserInfo = __decorate([
    typeorm_1.Entity('user_info')
], UserInfo);
exports.UserInfo = UserInfo;
