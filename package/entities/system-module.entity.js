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
let SystemModule = class SystemModule {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], SystemModule.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], SystemModule.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToMany(type => resource_entity_1.Resource, resource => resource.systemModule),
    __metadata("design:type", Array)
], SystemModule.prototype, "resources", void 0);
SystemModule = __decorate([
    typeorm_1.Entity('system_module')
], SystemModule);
exports.SystemModule = SystemModule;

//# sourceMappingURL=system-module.entity.js.map
