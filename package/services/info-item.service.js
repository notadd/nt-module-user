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
const typeorm_2 = require("typeorm");
const info_item_entity_1 = require("../entities/info-item.entity");
const entity_check_service_1 = require("./entity-check.service");
let InfoItemService = class InfoItemService {
    constructor(infoItemRepo, entityCheckService) {
        this.infoItemRepo = infoItemRepo;
        this.entityCheckService = entityCheckService;
    }
    async create(infoItem) {
        await this.entityCheckService.checkNameExist(info_item_entity_1.InfoItem, infoItem.name);
        await this.infoItemRepo.save(this.infoItemRepo.create(infoItem));
    }
    async delete(id) {
        const infoItem = await this.infoItemRepo.findOne(id, { relations: ['userInfos', 'infoGroups'] });
        await this.infoItemRepo.createQueryBuilder('infoItem').relation(info_item_entity_1.InfoItem, 'infoGroups').of(id).remove(infoItem.infoGroups);
        await this.infoItemRepo.remove(infoItem);
    }
    async update(updateInfoItemInput) {
        await this.entityCheckService.checkNameExist(info_item_entity_1.InfoItem, updateInfoItemInput.name);
        if (updateInfoItemInput.order) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { order: updateInfoItemInput.order });
        }
        if (updateInfoItemInput.type) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { type: updateInfoItemInput.type });
        }
        if (updateInfoItemInput.name) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { name: updateInfoItemInput.name });
        }
        if (updateInfoItemInput.description) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { description: updateInfoItemInput.description });
        }
        if (updateInfoItemInput.registerDisplay) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { registerDisplay: updateInfoItemInput.registerDisplay });
        }
        if (updateInfoItemInput.informationDisplay) {
            await this.infoItemRepo.update(updateInfoItemInput.id, { informationDisplay: updateInfoItemInput.informationDisplay });
        }
    }
    async findAll(pageNumber, pageSize) {
        if (pageNumber && pageSize) {
            return this.infoItemRepo.findAndCount({ skip: (pageNumber - 1) * pageSize, take: pageSize });
        }
        return this.infoItemRepo.find({ order: { order: 'ASC' } });
    }
};
InfoItemService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(info_item_entity_1.InfoItem)),
    __param(1, common_1.Inject(entity_check_service_1.EntityCheckService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        entity_check_service_1.EntityCheckService])
], InfoItemService);
exports.InfoItemService = InfoItemService;
