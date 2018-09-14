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
const info_group_entity_1 = require("../entities/info-group.entity");
const entity_check_service_1 = require("./entity-check.service");
let InfoGroupService = class InfoGroupService {
    constructor(infoGroupRepo, entityCheckService) {
        this.infoGroupRepo = infoGroupRepo;
        this.entityCheckService = entityCheckService;
    }
    async create(name, roleId) {
        await this.entityCheckService.checkNameExist(info_group_entity_1.InfoGroup, name);
        if (await this.infoGroupRepo.findOne({ role: { id: roleId } })) {
            throw new common_1.HttpException(i18n_1.__('The role information group already exists'), 409);
        }
        this.infoGroupRepo.save(this.infoGroupRepo.create({ name, role: { id: roleId } }));
    }
    async addInfoItem(infoGroupId, infoItemIds) {
        const infoItems = await this.infoGroupRepo
            .createQueryBuilder('infoGroup')
            .relation(info_group_entity_1.InfoGroup, 'infoItems')
            .of(infoGroupId)
            .loadMany();
        const duplicateIds = infoItems.map(infoItem => infoItem.id).filter(infoItemId => infoItemIds.includes(infoItemId));
        if (duplicateIds.length)
            throw new common_1.HttpException(i18n_1.__('Information item with id [%s] already exists', duplicateIds.toString()), 409);
        this.infoGroupRepo.createQueryBuilder('infoGroup').relation(info_group_entity_1.InfoGroup, 'infoItems').of(infoGroupId).add(infoItemIds);
    }
    async delete(id) {
        this.infoGroupRepo.delete(id);
    }
    async deleteIntoItem(infoGroupId, infoItemIds) {
        this.infoGroupRepo.createQueryBuilder('infoGroup').relation(info_group_entity_1.InfoGroup, 'infoItems').of(infoGroupId).remove(infoItemIds);
    }
    async update(id, name, roleId) {
        await this.entityCheckService.checkNameExist(info_group_entity_1.InfoGroup, name);
        this.infoGroupRepo.update(id, { name, role: { id: roleId } });
    }
    async findAll() {
        return this.infoGroupRepo.find();
    }
    async findItemsById(id) {
        return this.infoGroupRepo.createQueryBuilder('infoGroup').relation(info_group_entity_1.InfoGroup, 'infoItems').of(id).loadMany();
    }
};
InfoGroupService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(info_group_entity_1.InfoGroup)),
    __param(1, common_1.Inject(entity_check_service_1.EntityCheckService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        entity_check_service_1.EntityCheckService])
], InfoGroupService);
exports.InfoGroupService = InfoGroupService;

//# sourceMappingURL=info-group.service.js.map
