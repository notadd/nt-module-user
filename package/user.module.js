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
var UserModule_1;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const modules_container_1 = require("@nestjs/core/injector/modules-container");
const metadata_scanner_1 = require("@nestjs/core/metadata-scanner");
const typeorm_1 = require("@nestjs/typeorm");
const i18n_1 = require("i18n");
const typeorm_2 = require("typeorm");
const auth_gurad_1 = require("./auth/auth.gurad");
const auth_service_1 = require("./auth/auth.service");
const decorators_1 = require("./decorators");
const info_group_entity_1 = require("./entities/info-group.entity");
const info_item_entity_1 = require("./entities/info-item.entity");
const organization_entity_1 = require("./entities/organization.entity");
const permission_entity_1 = require("./entities/permission.entity");
const resource_entity_1 = require("./entities/resource.entity");
const role_entity_1 = require("./entities/role.entity");
const user_info_entity_1 = require("./entities/user-info.entity");
const user_entity_1 = require("./entities/user.entity");
const info_group_resolver_1 = require("./resolvers/info-group.resolver");
const info_item_resolver_1 = require("./resolvers/info-item.resolver");
const organization_resolver_1 = require("./resolvers/organization.resolver");
const resource_resolver_1 = require("./resolvers/resource.resolver");
const role_resolver_1 = require("./resolvers/role.resolver");
const user_resolver_1 = require("./resolvers/user.resolver");
const entity_check_service_1 = require("./services/entity-check.service");
const info_group_service_1 = require("./services/info-group.service");
const info_item_service_1 = require("./services/info-item.service");
const organization_service_1 = require("./services/organization.service");
const resource_service_1 = require("./services/resource.service");
const role_service_1 = require("./services/role.service");
const user_service_1 = require("./services/user.service");
const crypto_util_1 = require("./utils/crypto.util");
let UserModule = UserModule_1 = class UserModule {
    constructor(userService, modulesContainer, resourceRepo, permissionRepo, roleRepo, infoGroupRepo, userRepo) {
        this.userService = userService;
        this.modulesContainer = modulesContainer;
        this.resourceRepo = resourceRepo;
        this.permissionRepo = permissionRepo;
        this.roleRepo = roleRepo;
        this.infoGroupRepo = infoGroupRepo;
        this.userRepo = userRepo;
        this.metadataScanner = new metadata_scanner_1.MetadataScanner();
    }
    static forRoot(options) {
        i18n_1.configure({
            locales: ['en-US', 'zh-CN'],
            defaultLocale: options.i18n,
            directory: __dirname + '/i18n'
        });
        return {
            module: UserModule_1
        };
    }
    async onModuleInit() {
        await this.loadResourcesAndPermissions();
        await this.createDefaultRole();
        await this.createDefaultInfoGroup();
        await this.createSuperAdmin();
    }
    async loadResourcesAndPermissions() {
        const metadataMap = new Map();
        this.modulesContainer.forEach(module => {
            module.components.forEach(component => {
                const isResolverOrController = Reflect.getMetadataKeys(component.instance.constructor)
                    .filter(key => ['graphql:resolver_type', 'path']
                    .includes(key)).length > 0;
                if (isResolverOrController) {
                    const resource = Reflect.getMetadata(decorators_1.RESOURCE_DEFINITION, component.instance.constructor);
                    const prototype = Object.getPrototypeOf(component.instance);
                    if (prototype) {
                        const permissions = this.metadataScanner.scanFromPrototype(component.instance, prototype, name => {
                            return Reflect.getMetadata(decorators_1.PERMISSION_DEFINITION, component.instance, name);
                        });
                        if (resource) {
                            resource.name = i18n_1.__(resource.name);
                            permissions.forEach(permission => {
                                permission.name = i18n_1.__(permission.name);
                            });
                            metadataMap.set(resource.identify, { resource, permissions });
                        }
                    }
                }
            });
        });
        const scannedResourcesAndPermissions = [...metadataMap.values()].map(metadataValue => {
            metadataValue.permissions.forEach(v => v.resource = metadataValue.resource);
            return { permissions: metadataValue.permissions, resource: metadataValue.resource };
        });
        const scannedResources = scannedResourcesAndPermissions.map(v => v.resource);
        const resourceIdentifies = [...metadataMap.keys()].length === 0 ? ['__delete_all_resource__'] : [...metadataMap.keys()];
        const notExistResources = await this.resourceRepo.find({ where: { identify: typeorm_2.Not(typeorm_2.In(resourceIdentifies)) } });
        if (notExistResources.length > 0)
            await this.resourceRepo.delete(notExistResources.map(v => v.id));
        const existResources = await this.resourceRepo.find({ order: { id: 'ASC' } });
        const newResourcess = scannedResources.filter(sr => !existResources.map(v => v.identify).includes(sr.identify));
        if (newResourcess.length > 0)
            await this.resourceRepo.save(this.resourceRepo.create(newResourcess));
        const scannedPermissions = [].concat(...scannedResourcesAndPermissions.map(v => v.permissions));
        const resource = await this.resourceRepo.find({ where: { identify: typeorm_2.In(scannedPermissions.map(v => v.resource.identify)) } });
        scannedPermissions.forEach(permission => {
            permission.resource = resource.find(v => v.identify === permission.resource.identify);
        });
        const permissionIdentifies = scannedPermissions.map(v => v.identify).length === 0 ? ['__delete_all_permission__'] : scannedPermissions.map(v => v.identify);
        const notExistPermissions = await this.permissionRepo.find({ where: { identify: typeorm_2.Not(typeorm_2.In(permissionIdentifies)) } });
        if (notExistPermissions.length > 0)
            await this.permissionRepo.delete(notExistPermissions.map(v => v.id));
        const existPermissions = await this.permissionRepo.find({ order: { id: 'ASC' } });
        const newPermissions = scannedPermissions.filter(sp => !existPermissions.map(v => v.identify).includes(sp.identify));
        if (newPermissions.length > 0)
            await this.permissionRepo.save(this.permissionRepo.create(newPermissions));
    }
    async createDefaultRole() {
        const defaultRole = await this.roleRepo.findOne(1);
        if (defaultRole)
            return;
        await this.roleRepo.save(this.roleRepo.create({
            id: 1,
            name: i18n_1.__('ordinary user')
        }));
    }
    async createDefaultInfoGroup() {
        const defaultInfoGroup = await this.infoGroupRepo.findOne(1);
        if (defaultInfoGroup)
            return;
        await this.infoGroupRepo.save(this.infoGroupRepo.create({
            id: 1,
            name: i18n_1.__('ordinary user information group'),
            role: {
                id: 1
            }
        }));
    }
    async createSuperAdmin() {
        const sadmin = await this.userRepo.findOne({ where: { username: 'sadmin' } });
        if (sadmin)
            return;
        await this.userService.createUser({ username: 'sadmin', password: 'sadmin' });
    }
};
UserModule = UserModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([organization_entity_1.Organization, user_entity_1.User, role_entity_1.Role, resource_entity_1.Resource, permission_entity_1.Permission, info_group_entity_1.InfoGroup, info_item_entity_1.InfoItem, user_info_entity_1.UserInfo])
        ],
        controllers: [],
        providers: [
            { provide: core_1.APP_GUARD, useClass: auth_gurad_1.AuthGurad },
            auth_service_1.AuthService,
            entity_check_service_1.EntityCheckService,
            organization_resolver_1.OrganizationResolver, organization_service_1.OrganizationService,
            user_resolver_1.UserResolver, user_service_1.UserService,
            role_resolver_1.RoleResolver, role_service_1.RoleService,
            resource_resolver_1.ResourceResolver, resource_service_1.ResourceService,
            info_group_resolver_1.InfoGroupResolver, info_group_service_1.InfoGroupService,
            info_item_resolver_1.InfoItemResolver, info_item_service_1.InfoItemService,
            crypto_util_1.CryptoUtil
        ],
        exports: [auth_service_1.AuthService, organization_service_1.OrganizationService, user_service_1.UserService, role_service_1.RoleService, info_group_service_1.InfoGroupService, info_item_service_1.InfoItemService]
    }),
    __param(0, common_1.Inject(user_service_1.UserService)),
    __param(1, common_1.Inject(modules_container_1.ModulesContainer)),
    __param(2, typeorm_1.InjectRepository(resource_entity_1.Resource)),
    __param(3, typeorm_1.InjectRepository(permission_entity_1.Permission)),
    __param(4, typeorm_1.InjectRepository(role_entity_1.Role)),
    __param(5, typeorm_1.InjectRepository(info_group_entity_1.InfoGroup)),
    __param(6, typeorm_1.InjectRepository(user_entity_1.User)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        modules_container_1.ModulesContainer,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserModule);
exports.UserModule = UserModule;

//# sourceMappingURL=user.module.js.map
