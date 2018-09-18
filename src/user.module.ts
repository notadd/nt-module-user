import { DynamicModule, Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { __ as t, configure as i18nConfigure } from 'i18n';
import { join } from 'path';
import { In, Not, Repository } from 'typeorm';

import { AuthGurad } from './auth/auth.gurad';
import { AuthService } from './auth/auth.service';
import { PERMISSION_DEFINITION, RESOURCE_DEFINITION } from './decorators';
import { InfoGroup } from './entities/info-group.entity';
import { InfoItem } from './entities/info-item.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { UserInfo } from './entities/user-info.entity';
import { User } from './entities/user.entity';
import { InfoGroupResolver } from './resolvers/info-group.resolver';
import { InfoItemResolver } from './resolvers/info-item.resolver';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { ResourceResolver } from './resolvers/resource.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { EntityCheckService } from './services/entity-check.service';
import { InfoGroupService } from './services/info-group.service';
import { InfoItemService } from './services/info-item.service';
import { OrganizationService } from './services/organization.service';
import { ResourceService } from './services/resource.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { CryptoUtil } from './utils/crypto.util';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Organization, User, Role, Resource, Permission, InfoGroup, InfoItem, UserInfo])
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthGurad },
        AuthService,
        EntityCheckService,
        OrganizationResolver, OrganizationService,
        UserResolver, UserService,
        RoleResolver, RoleService,
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
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>,
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) {
        this.metadataScanner = new MetadataScanner();
    }

    static forRoot(options: { i18n: 'en-US' | 'zh-CN' }): DynamicModule {
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
        return {
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
        const metadataMap: Map<string, { resource: Resource, permissions: Permission[] }> = new Map();
        // Iterate Modules from module container
        this.modulesContainer.forEach(module => {
            for (const [key, value] of [...module.components, ...module.routes]) {
                const isResolverOrController =
                    Reflect.getMetadataKeys(value.instance.constructor)
                        .filter(key => ['graphql:resolver_type', 'path']
                            .includes(key)).length > 0;

                if (isResolverOrController) {
                    // Get the metadata in the @Resource() annotation on the Resolver or Controller class
                    const resource: Resource = Reflect.getMetadata(RESOURCE_DEFINITION, value.instance.constructor);
                    // Get the prototype object of the Resolver or Controller class
                    const prototype = Object.getPrototypeOf(value.instance);
                    if (prototype) {
                        // Get the method name in the Resolver or Controller class,
                        // the name in the callback function is the method name in the current class
                        const permissions: Permission[] = this.metadataScanner.scanFromPrototype(value.instance, prototype, name => {
                            // Get the metadata in the @Permission() annotation on the method in the Resolver or Controller class
                            return Reflect.getMetadata(PERMISSION_DEFINITION, value.instance, name);
                        });
                        // If the metadata exists, it will be added to the resource collection,
                        // and it will be automatically deduplicated according to resource.indetify
                        if (resource) {
                            // Translate the resources name
                            resource.name = t(resource.name);
                            // Translate the permissions name
                            permissions.forEach(permission => {
                                permission.name = t(permission.name);
                            });
                            metadataMap.set(resource.identify, { resource, permissions });
                        }
                    }
                }
            }
        });

        /**
         * LOOK ME:
         *
         * The following are the create and delete logic for resources and permissions.
         *
         * When the permission uniquely identifies the change,
         * the relationship between the changed permission and the corresponding role will also be deleted.
         *
         */

        // All resource annotations and all permission annotations that were scanned
        const scannedResourcesAndPermissions = [...metadataMap.values()].map(metadataValue => {
            // Bind permissions to the corresponding resource
            metadataValue.permissions.forEach(v => v.resource = metadataValue.resource);
            return { permissions: metadataValue.permissions, resource: metadataValue.resource };
        });

        // All resource annotations that were scanned
        const scannedResources = scannedResourcesAndPermissions.map(v => v.resource);

        // Remove the resources and their permissions which were removed from the annotation
        const resourceIdentifies = [...metadataMap.keys()].length === 0 ? ['__delete_all_resource__'] : [...metadataMap.keys()];
        const notExistResources = await this.resourceRepo.find({ where: { identify: Not(In(resourceIdentifies)) } });
        if (notExistResources.length > 0) await this.resourceRepo.delete(notExistResources.map(v => v.id));
        // Filter out the new resources
        const existResources = await this.resourceRepo.find({ order: { id: 'ASC' } });
        const newResourcess = scannedResources.filter(sr => !existResources.map(v => v.identify).includes(sr.identify));
        // Save the new resources
        if (newResourcess.length > 0) await this.resourceRepo.save(this.resourceRepo.create(newResourcess));
        // Update existing resources name
        existResources.forEach(er => {
            er.name = scannedResources.find(sr => sr.identify === er.identify).name;
        });
        await this.resourceRepo.save(existResources);

        // All permission annotations that were scanned
        const scannedPermissions = <Permission[]>[].concat(...scannedResourcesAndPermissions.map(v => v.permissions));
        // Query the resources of all the permission annotations scanned
        const resource = await this.resourceRepo.find({ where: { identify: In(scannedPermissions.map(v => v.resource.identify)) } });
        // Bind resources to permissions
        scannedPermissions.forEach(permission => {
            permission.resource = resource.find(v => v.identify === permission.resource.identify);
        });
        // Remove the permissions that were removed from annotations
        // tslint:disable-next-line:max-line-length
        const permissionIdentifies = scannedPermissions.map(v => v.identify).length === 0 ? ['__delete_all_permission__'] : scannedPermissions.map(v => v.identify);
        const notExistPermissions = await this.permissionRepo.find({ where: { identify: Not(In(permissionIdentifies)) } });
        if (notExistPermissions.length > 0) await this.permissionRepo.delete(notExistPermissions.map(v => v.id));
        // Filter out the new permissions
        const existPermissions = await this.permissionRepo.find({ order: { id: 'ASC' } });
        const newPermissions = scannedPermissions.filter(sp => !existPermissions.map(v => v.identify).includes(sp.identify));
        // Save the new permissions
        if (newPermissions.length > 0) await this.permissionRepo.save(this.permissionRepo.create(newPermissions));
        // Update existing permissions name
        existPermissions.forEach(ep => {
            ep.name = scannedPermissions.find(sp => sp.identify === ep.identify).name;
            ep.action = scannedPermissions.find(sp => sp.identify === ep.identify).action;
        });
        await this.permissionRepo.save(existPermissions);
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