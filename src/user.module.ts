import { DynamicModule, Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { SmsModule } from '@notadd/addon-sms';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { __ as t, configure as i18nConfigure } from 'i18n';
import { join } from 'path';
import { In, Not, Repository } from 'typeorm';

import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { AUTH_TOKEN_WHITE_LIST } from './constants/auth.constant';
import { PERMISSION_DEFINITION, RESOURCE_DEFINITION } from './decorators';
import { InfoGroup } from './entities/info-group.entity';
import { InfoItem } from './entities/info-item.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { SystemModule } from './entities/system-module.entity';
import { UserInfo } from './entities/user-info.entity';
import { User } from './entities/user.entity';
import { InfoGroupResolver } from './resolvers/info-group.resolver';
import { InfoItemResolver } from './resolvers/info-item.resolver';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { ResourceResolver } from './resolvers/resource.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { SystemModuleResolver } from './resolvers/system-module.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { EntityCheckService } from './services/entity-check.service';
import { InfoGroupService } from './services/info-group.service';
import { InfoItemService } from './services/info-item.service';
import { OrganizationService } from './services/organization.service';
import { ResourceService } from './services/resource.service';
import { RoleService } from './services/role.service';
import { SystemModuleService } from './services/system-module.service';
import { UserService } from './services/user.service';
import { CryptoUtil } from './utils/crypto.util';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Organization, User, Role, SystemModule, Resource, Permission, InfoGroup, InfoItem, UserInfo]),
        SmsModule
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        AuthService,
        EntityCheckService,
        OrganizationResolver, OrganizationService,
        UserResolver, UserService,
        RoleResolver, RoleService,
        SystemModuleResolver, SystemModuleService,
        ResourceResolver, ResourceService,
        InfoGroupResolver, InfoGroupService,
        InfoItemResolver, InfoItemService,
        CryptoUtil
    ],
    exports: [AuthService, OrganizationService, UserService, RoleService, InfoGroupService, InfoItemService]
})
export class UserModule implements OnModuleInit {
    private readonly metadataScanner: MetadataScanner;

    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
        @InjectRepository(SystemModule) private readonly systemModuleRepo: Repository<SystemModule>,
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>,
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) {
        this.metadataScanner = new MetadataScanner();
    }

    static forRoot(options: { i18n: 'en-US' | 'zh-CN', authTokenWhiteList?: string[] }): DynamicModule {
        if (!existsSync('src/i18n')) {
            mkdirSync(join('src/i18n'));
            writeFileSync(join('src/i18n', 'zh-CN.json'), readFileSync(__dirname + '/i18n/zh-CN.json'));
            writeFileSync(join('src/i18n', 'en-US.json'), readFileSync(__dirname + '/i18n/en-US.json'));
        }
        i18nConfigure({
            locales: ['en-US', 'zh-CN'],
            defaultLocale: options.i18n,
            directory: 'src/i18n'
        });
        if (options.authTokenWhiteList) {
            options.authTokenWhiteList.push(...['IntrospectionQuery', 'login', 'adminLogin', 'register']);
        } else {
            options.authTokenWhiteList = ['IntrospectionQuery', 'login', 'adminLogin', 'register'];
        }
        return {
            providers: [{ provide: AUTH_TOKEN_WHITE_LIST, useValue: options.authTokenWhiteList }],
            module: UserModule
        };
    }

    async onModuleInit() {
        await this.loadResourcesAndPermissions();
        await this.createDefaultRole();
        await this.createDefaultInfoGroup();
        await this.createSuperAdmin();
    }

    /**
     * Load resources, permission annotations, and save them to the database
     */
    private async loadResourcesAndPermissions() {
        const metadataMap: Map<string, { name: string, resource: Resource[] }> = new Map();
        this.modulesContainer.forEach((moduleValue, moduleKey) => {
            for (const [componentKey, componentKeyValue] of [...moduleValue.components, ...moduleValue.routes]) {
                const isResolverOrController =
                    Reflect.getMetadataKeys(componentKeyValue.instance.constructor)
                        .filter(key => ['graphql:resolver_type', 'path']
                            .includes(key)).length > 0;

                if (isResolverOrController) {
                    const resource: Resource = Reflect.getMetadata(RESOURCE_DEFINITION, componentKeyValue.instance.constructor);
                    const prototype = Object.getPrototypeOf(componentKeyValue.instance);

                    if (resource && prototype) {
                        const permissions: Permission[] = this.metadataScanner.scanFromPrototype(componentKeyValue.instance, prototype, name => {
                            return Reflect.getMetadata(PERMISSION_DEFINITION, componentKeyValue.instance, name);
                        });
                        resource.permissions = permissions;

                        if (metadataMap.has(moduleKey)) {
                            metadataMap.get(moduleKey).name = t(moduleValue.metatype.name);
                            metadataMap.get(moduleKey).resource.push(resource);
                        } else {
                            metadataMap.set(moduleKey, { name: t(moduleValue.metatype.name), resource: [resource] });
                        }
                    }
                }
            }
        });

        metadataMap.forEach(value => {
            value.resource.forEach(resource => {
                resource.name = t(resource.name);
                resource.permissions.forEach(p => p.name = t(p.name));
            });
        });

        // Sacnned modules
        const scannedModules = [...metadataMap.values()].map(v => ({ name: v.name }));

        // Delete removed module
        const notExistingModule = await this.systemModuleRepo.find({
            where: { name: Not(In(scannedModules.length ? scannedModules.map(v => v.name) : ['__delete_all_system_module__'])) }
        });
        if (notExistingModule.length) await this.systemModuleRepo.delete(notExistingModule.map(v => v.id));
        // Create new module
        const existingModules = await this.systemModuleRepo.find({ order: { id: 'ASC' } });
        const newModules = scannedModules.filter(sm => !existingModules.map(v => v.name).includes(sm.name));
        if (newModules.length) await this.systemModuleRepo.save(this.systemModuleRepo.create(newModules));
        // Update existing module
        if (existingModules.length) {
            existingModules.forEach(em => {
                em.name = scannedModules.find(sm => sm.name === em.name).name;
            });
            await this.systemModuleRepo.save(existingModules);
        }

        // Sacnned resources
        for (const [key, value] of metadataMap) {
            const resourceModule = await this.systemModuleRepo.findOne({ where: { name: value.name } });
            value.resource.forEach(async resouece => {
                resouece.systemModule = resourceModule;
            });
        }
        const scannedResources: Resource[] = <Resource[]>[].concat(...[...metadataMap.values()].map(v => v.resource));

        // Delete removed resource
        const resourceIdentifies = scannedResources.length ? scannedResources.map(v => v.identify) : ['__delete_all_resource__'];
        const notExistResources = await this.resourceRepo.find({ where: { identify: Not(In(resourceIdentifies)) } });
        if (notExistResources.length > 0) await this.resourceRepo.delete(notExistResources.map(v => v.id));
        // Create new resource
        const existResources = await this.resourceRepo.find({ order: { id: 'ASC' } });
        const newResourcess = scannedResources.filter(sr => !existResources.map(v => v.identify).includes(sr.identify));
        if (newResourcess.length > 0) await this.resourceRepo.save(this.resourceRepo.create(newResourcess));
        // Update resource
        if (existResources.length) {
            existResources.forEach(er => {
                er.name = scannedResources.find(sr => sr.identify === er.identify).name;
            });
            await this.resourceRepo.save(existResources);
        }

        // Sacnned permissions
        const scannedPermissions = <Permission[]>[].concat(...scannedResources.map(metadataValue => {
            metadataValue.permissions.forEach(v => v.resource = metadataValue);
            return metadataValue.permissions;
        }));
        // Delete removed permission
        const resource = await this.resourceRepo.find({ where: { identify: In(scannedPermissions.map(v => v.resource.identify)) } });
        scannedPermissions.forEach(permission => {
            permission.resource = resource.find(v => v.identify === permission.resource.identify);
        });
        // Create removed permission
        const permissionIdentifies = scannedPermissions.length ? scannedPermissions.map(v => v.identify) : ['__delete_all_permission__'];
        const notExistPermissions = await this.permissionRepo.find({ where: { identify: Not(In(permissionIdentifies)) } });
        if (notExistPermissions.length > 0) await this.permissionRepo.delete(notExistPermissions.map(v => v.id));

        const existPermissions = await this.permissionRepo.find({ order: { id: 'ASC' } });
        const newPermissions = scannedPermissions.filter(sp => !existPermissions.map(v => v.identify).includes(sp.identify));
        if (newPermissions.length > 0) await this.permissionRepo.save(this.permissionRepo.create(newPermissions));
        // Update permission
        if (existPermissions.length) {
            existPermissions.forEach(ep => {
                ep.name = scannedPermissions.find(sp => sp.identify === ep.identify).name;
                ep.action = scannedPermissions.find(sp => sp.identify === ep.identify).action;
            });
            await this.permissionRepo.save(existPermissions);
        }
    }

    /**
     * Create a default ordinary user role
     */
    private async createDefaultRole() {
        const defaultRole = await this.roleRepo.findOne(1);

        if (defaultRole) return;

        await this.roleRepo.save(this.roleRepo.create({
            id: 1,
            name: t('ordinary user')
        }));
    }

    /**
     * Create a default information group
     */
    private async createDefaultInfoGroup() {
        const defaultInfoGroup = await this.infoGroupRepo.findOne(1);

        if (defaultInfoGroup) return;

        await this.infoGroupRepo.save(this.infoGroupRepo.create({
            id: 1,
            name: t('ordinary user information group'),
            role: {
                id: 1
            }
        }));
    }

    /**
     * Create a system super administrator
     */
    private async createSuperAdmin() {
        const sadmin = await this.userRepo.findOne({ where: { username: 'sadmin' } });
        if (sadmin) return;
        await this.userService.createUser({ username: 'sadmin', password: 'sadmin' });
    }
}