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
const typeorm_1 = require("@nestjs/typeorm");
const i18n_1 = require("i18n");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../entities/permission.entity");
const role_entity_1 = require("../entities/role.entity");
const entity_check_service_1 = require("./entity-check.service");
let RoleService = class RoleService {
    constructor(entityCheckService, roleRepo, permissionRepo) {
        this.entityCheckService = entityCheckService;
        this.roleRepo = roleRepo;
        this.permissionRepo = permissionRepo;
    }
    async createRole(name) {
        await this.entityCheckService.checkNameExist(role_entity_1.Role, name);
        await this.roleRepo.save(this.roleRepo.create({ name }));
    }
    async updateRole(id, name) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            throw new common_1.HttpException(i18n_1.__('The role id of %s does not exist', id.toString()), 404);
        }
        if (name !== role.name) {
            await this.entityCheckService.checkNameExist(role_entity_1.Role, name);
        }
        role.name = name;
        await this.roleRepo.save(role);
    }
    async deleteRole(id) {
        const role = await this.roleRepo.findOne(id, { relations: ['permissions'] });
        if (!role) {
            throw new common_1.HttpException(i18n_1.__('The role id of %s does not exist', id.toString()), 404);
        }
        try {
            this.roleRepo.createQueryBuilder('role').relation(role_entity_1.Role, 'permissions').of(role).remove(role.permissions);
            await this.roleRepo.remove(role);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
    async setPermissions(id, permissionIds) {
        const role = await this.roleRepo.findOne(id);
        if (!role) {
            throw new common_1.HttpException(i18n_1.__('The role id of %s does not exist', id.toString()), 404);
        }
        const permissionArr = await this.permissionRepo.findByIds(permissionIds);
        permissionIds.forEach(permissionId => {
            const exist = permissionArr.find(permission => {
                return permission.id === permissionId;
            });
            if (!exist) {
                throw new common_1.HttpException(i18n_1.__('The permission id of %s does not exist', permissionId.toString()), 404);
            }
        });
        role.permissions = permissionArr;
        await this.roleRepo.save(role);
    }
    async findRoles(pageNumber, pageSize) {
        if (pageNumber && pageSize) {
            return this.roleRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
        }
        return this.roleRepo.find();
    }
    async findOneRoleInfo(roleId) {
        const role = await this.roleRepo.findOne(roleId, { relations: ['permissions'] });
        if (!role) {
            throw new common_1.HttpException(i18n_1.__('The role id of %s does not exist', roleId.toString()), 404);
        }
        const roleInfoData = {
            id: role.id,
            name: role.name,
            permissions: (role.permissions && role.permissions.length > 0) ? role.permissions : [],
            infoItems: await this.findInfoGroupItemsByIds([roleId])
        };
        return roleInfoData;
    }
    async findInfoGroupItemsByIds(ids) {
        let infoItemsArr = [];
        const roles = await this.roleRepo.createQueryBuilder('role')
            .leftJoinAndSelect('infoGroup', 'infoGroup')
            .leftJoinAndSelect('infoGroup.infoItems', 'infoItems')
            .whereInIds(ids)
            .orderBy('infoItems.order', 'ASC')
            .getMany();
        if (!roles || roles.length === 0) {
            return infoItemsArr;
        }
        roles.forEach(role => {
            if (role.infoGroup && role.infoGroup.infoItems && role.infoGroup.infoItems.length > 0) {
                role.infoGroup.infoItems.forEach(infoItem => infoItemsArr.push(infoItem));
            }
        });
        const temp = {};
        infoItemsArr = infoItemsArr.reduce((item, next) => {
            temp[next.name] ? '' : temp[next.name] = item.push(next);
            return item;
        }, []);
        return infoItemsArr;
    }
};
RoleService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(entity_check_service_1.EntityCheckService)),
    __param(1, typeorm_1.InjectRepository(role_entity_1.Role)),
    __param(2, typeorm_1.InjectRepository(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [entity_check_service_1.EntityCheckService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RoleService);
exports.RoleService = RoleService;
