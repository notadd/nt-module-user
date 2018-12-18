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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
const role_entity_1 = require("./role.entity");
const user_info_entity_1 = require("./user-info.entity");
let User = class User {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        nullable: true,
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
        nullable: true
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({
        unique: true,
        nullable: true
    }),
    __metadata("design:type", String)
], User.prototype, "mobile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.OneToMany(type => user_info_entity_1.UserInfo, userInfo => userInfo.user),
    __metadata("design:type", Array)
], User.prototype, "userInfos", void 0);
__decorate([
    typeorm_1.Column({
        default: false
    }),
    __metadata("design:type", Boolean)
], User.prototype, "banned", void 0);
__decorate([
    typeorm_1.Column({
        default: false
    }),
    __metadata("design:type", Boolean)
], User.prototype, "recycle", void 0);
__decorate([
    typeorm_1.ManyToMany(type => role_entity_1.Role, role => role.users, {
        onDelete: 'CASCADE'
    }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    typeorm_1.ManyToMany(type => organization_entity_1.Organization, organization => organization.users, {
        onDelete: 'CASCADE'
    }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "organizations", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        transformer: {
            from: (date) => {
                return moment_1.default(date).format('YYYY-MM-DD HH:mm:ss');
            },
            to: () => {
                return new Date();
            }
        }
    }),
    __metadata("design:type", String)
], User.prototype, "createTime", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        transformer: {
            from: (date) => {
                return moment_1.default(date).format('YYYY-MM-DD HH:mm:ss');
            },
            to: () => {
                return new Date();
            }
        }
    }),
    __metadata("design:type", String)
], User.prototype, "updateTime", void 0);
User = __decorate([
    typeorm_1.Entity('user')
], User);
exports.User = User;
