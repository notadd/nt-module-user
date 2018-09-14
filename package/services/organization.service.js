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
const organization_entity_1 = require("../entities/organization.entity");
const user_entity_1 = require("../entities/user.entity");
const entity_check_service_1 = require("./entity-check.service");
let OrganizationService = class OrganizationService {
    constructor(entityCheckService, organizationReq, userRep) {
        this.entityCheckService = entityCheckService;
        this.organizationReq = organizationReq;
        this.userRep = userRep;
    }
    async findRoots() {
        return this.organizationReq.findRoots();
    }
    async findAllTrees() {
        return this.organizationReq.findTrees();
    }
    async findChildren(id) {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('The organization with id of %s does not exist', id.toString()), 404);
        }
        const children = await this.organizationReq.findDescendantsTree(exist);
        return children;
    }
    async createOrganization(name, parentId) {
        let parent;
        if (parentId) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new common_1.HttpException(i18n_1.__('The parent organization with id of %s does not exist', parentId.toString()), 404);
            }
        }
        await this.entityCheckService.checkNameExist(organization_entity_1.Organization, name);
        const organization = this.organizationReq.create({ name, parent });
        try {
            await this.organizationReq.save(organization);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
    async updateOrganization(id, name, parentId) {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('The organization with id of %s does not exist', id.toString()), 404);
        }
        if (name !== exist.name) {
            await this.entityCheckService.checkNameExist(organization_entity_1.Organization, name);
        }
        let parent;
        if (parentId) {
            parent = await this.organizationReq.findOne(parentId);
            if (!parent) {
                throw new common_1.HttpException(i18n_1.__('The parent organization with id of %s does not exist', parentId.toString()), 404);
            }
        }
        try {
            exist.name = name;
            exist.parent = parent;
            await this.organizationReq.save(exist);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
    async deleteOrganization(id) {
        const exist = await this.organizationReq.findOne(id);
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('The organization with id of %s does not exist', id.toString()), 404);
        }
        const children = await this.organizationReq.findDescendants(exist);
        if (children) {
            throw new common_1.HttpException('Cannot delete the organization that have child organizations', 406);
        }
        try {
            await this.organizationReq.delete(id);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
    async addUsersToOrganization(id, userIds) {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('The organization with id of %s does not exist', id.toString()), 404);
        }
        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new common_1.HttpException(i18n_1.__('The user id of %s does not exist', userId.toString()), 404);
            }
        });
        exist.users.forEach(user => {
            const find = userIds.find(id => {
                return id === user.id;
            });
            if (find) {
                throw new common_1.HttpException(i18n_1.__('User with id of %s is already under organization', user.id.toString()), 409);
            }
        });
        exist.users.push(...userArr);
        try {
            await this.organizationReq.save(exist);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
    async deleteUserFromOrganization(id, userIds) {
        const exist = await this.organizationReq.findOne(id, { relations: ['users'] });
        if (!exist) {
            throw new common_1.HttpException(i18n_1.__('The organization with id of %s does not exist', id.toString()), 404);
        }
        const userArr = await this.userRep.findByIds(userIds);
        userIds.forEach(userId => {
            const find = userArr.find(user => {
                return user.id === userId;
            });
            if (!find) {
                throw new common_1.HttpException(i18n_1.__('The user id of %s does not exist', userId.toString()), 404);
            }
            const index = exist.users.findIndex(user => {
                return user.id === userId;
            });
            if (index < 0) {
                throw new common_1.HttpException(i18n_1.__('The user id of %s does not appear in this organization', userId.toString()), 404);
            }
            exist.users.splice(index, 1);
        });
        try {
            await this.organizationReq.save(exist);
        }
        catch (err) {
            throw new common_1.HttpException(i18n_1.__('Database error %s', err.toString()), 500);
        }
    }
};
OrganizationService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(entity_check_service_1.EntityCheckService)),
    __param(1, typeorm_1.InjectRepository(organization_entity_1.Organization)),
    __param(2, typeorm_1.InjectRepository(user_entity_1.User)),
    __metadata("design:paramtypes", [entity_check_service_1.EntityCheckService,
        typeorm_2.TreeRepository,
        typeorm_2.Repository])
], OrganizationService);
exports.OrganizationService = OrganizationService;

//# sourceMappingURL=organization.service.js.map
