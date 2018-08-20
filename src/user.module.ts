import { Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InjectEntityManager, InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';

import { AuthService } from './authentication/authentication.service';
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
        AuthService,
        OrganizationResolver, OrganizationService,
        UserResolver, UserService,
        RoleResolver, RoleService,
        ResourceResolver, ResourceService,
        InfoGroupResolver, InfoGroupService,
        InfoItemResolver, InfoItemService,
        CryptoUtil
    ],
    exports: []
})
export class UserModule implements OnModuleInit {
    private readonly metadataScanner: MetadataScanner;

    constructor(
        @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
        @InjectEntityManager() private readonly entityManager: EntityManager,
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>
    ) {
        this.metadataScanner = new MetadataScanner();
    }

    async onModuleInit() {
        await this.loadResourcesAndPermissions();
        await this.createDefaultRole();
        await this.createDefaultInfoGroup();
    }

    /**
     * 加载资源、权限注解，并将其保存到数据库中
     */
    private async loadResourcesAndPermissions() {
        const metadataMap: Map<string, { resource: Resource, permissions: Permission[] }> = new Map();
        // 遍历 Module
        this.modulesContainer.forEach(value => {
            // 遍历 Module 中的 components
            value.components.forEach(value => {
                // 判断当前 component 是否是 Resolver 或 Controller
                const isResolverOrController =
                    Reflect.getMetadataKeys(value.instance.constructor)
                        .filter(key => ['graphql:resolver_type', 'path']
                            .includes(key)).length > 0;

                if (isResolverOrController) {
                    // 获取 Resolver 或 Controller 类上 @Resource() 注解中的元数据
                    const resource: Resource = Reflect.getMetadata(RESOURCE_DEFINITION, value.instance.constructor);
                    // 获取 Resolver 或 Controller 类的原型对象
                    const prototype = Object.getPrototypeOf(value.instance);
                    if (prototype) {
                        // 获取 Resolver 或 Controller 类中的方法名，回调函数中的 name 是当前类中的方法名
                        const permissions: Permission[] = this.metadataScanner.scanFromPrototype(value.instance, prototype, name => {
                            // 获取 Resolver 或 Controller 类中方法上的 @Permission() 注解中的元数据
                            return Reflect.getMetadata(PERMISSION_DEFINITION, value.instance, name);
                        });
                        // 如果元数据存在，则添加到资源集合中，此时会根据 resource.indetify 自动去重
                        if (resource) metadataMap.set(resource.identify, { resource, permissions });
                    }
                }
            });
        });

        /**
         * LOOK ME:
         *
         * 以下是资源、权限的新增和删除逻辑
         *
         * 当权限唯一标识 identify 更改时，被更改的权限与对应的所有角色的关系也将被删除
         *
         * TODO:  根据注解定义，自动更新数据库中对应的 name identify action 信息
         */

        // 扫描到的所有资源注解
        const scannedResources = [...metadataMap.values()].map(matadataValue => matadataValue.resource);
        // 删除注解中移除的资源及其权限
        const resourceIdentifies = [...metadataMap.keys()].length === 0 ? ['__delete_all_resource__'] : [...metadataMap.keys()];
        const notExistResources = await this.resourceRepo.find({ where: { identify: Not(In(resourceIdentifies)) } });
        if (notExistResources.length > 0) await this.resourceRepo.delete(notExistResources.map(v => v.id));
        // 过滤出新增的资源
        const existResources = await this.resourceRepo.find({ order: { id: 'ASC' } });
        const newResourcess = scannedResources.filter(sr => !existResources.map(v => v.identify).includes(sr.identify));
        // 保存新增的资源
        if (newResourcess.length > 0) await this.entityManager.insert(Resource, this.resourceRepo.create(newResourcess));

        // 扫描到的所有权限注解
        const scannedPermissions = <Permission[]>[].concat(...await Promise.all([...metadataMap.values()].map(async matadataValue => {
            const resource = await this.resourceRepo.findOne({ where: { identify: matadataValue.resource.identify } });
            matadataValue.permissions.forEach(permission => {
                permission.resource = resource;
            });
            return matadataValue.permissions;
        })));
        // 删除注解中移除的权限
        // tslint:disable-next-line:max-line-length
        const permissionIdentifies = scannedPermissions.map(v => v.identify).length === 0 ? ['__delete_all_permission__'] : scannedPermissions.map(v => v.identify);
        const notExistPermissions = await this.permissionRepo.find({ where: { identify: Not(In(permissionIdentifies)) } });
        if (notExistPermissions.length > 0) await this.permissionRepo.delete(notExistPermissions.map(v => v.id));
        // 过滤出新增的权限并保存
        const existPermissions = await this.permissionRepo.find({ order: { id: 'ASC' } });
        const newPermissions = scannedPermissions.filter(sr => !existPermissions.map(v => v.identify).includes(sr.identify));
        // 保存新增的权限
        if (newPermissions.length > 0) await this.entityManager.insert(Permission, this.permissionRepo.create(newPermissions));
    }

    /**
     * 创建默认普通用户角色
     *
     * 默认的普通用户角色ID始终为1
     */
    private async createDefaultRole() {
        const defaultRole = await this.roleRepo.findOne(1);

        if (defaultRole) return;

        this.roleRepo.save(this.roleRepo.create({
            id: 1,
            name: '普通用户'
        }));
    }

    /**
     * 创建默认信息组
     *
     * 默认的信息组为普通用户角色的信息组，其ID始终为1
     */
    private async createDefaultInfoGroup() {
        const defaultInfoGroup = await this.infoGroupRepo.findOne(1);

        if (defaultInfoGroup) return;

        this.infoGroupRepo.save(this.infoGroupRepo.create({
            id: 1,
            name: '普通用户信息组',
            role: {
                id: 1
            }
        }));
    }
}