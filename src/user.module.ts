import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { GraphQLModule } from '@nestjs/graphql';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService } from './auth/auth.service';
import { AuthStrategy } from './auth/auth.strategy';
import { PERMISSION_DEFINITION } from './decorators/permission.decorator';
import { RESOURCE_DEFINITION } from './decorators/resource.decorator';
import { InfoGroup } from './entities/info-group.entity';
import { InfoItem } from './entities/info-item.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { UserInfo } from './entities/user-info.entity';
import { User } from './entities/user.entity';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { ResourceResolver } from './resolvers/resource.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { OrganizationService } from './services/organization.service';
import { ResourceService } from './services/resource.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { CryptoUtil } from './utils/crypto.util';
import { InfoGroupResolver } from './resolvers/info-group.resolver';
import { InfoGroupService } from './services/info-group.service';
import { InfoItemResolver } from './resolvers/info-item.resolver';
import { InfoItemService } from './services/info-item.service';

@Module({
    imports: [
        GraphQLModule,
        TypeOrmModule.forFeature([Organization, User, Role, Resource, Permission, InfoGroup, InfoItem, UserInfo]),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'postgres',
            entities: ['./**/*.entity.ts'],
            maxQueryExecutionTime: 1000,
            synchronize: true,
            // dropSchema: true,
            logging: true,
            logger: 'advanced-console'
        })
    ],
    controllers: [],
    providers: [
        AuthService, AuthStrategy,
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
    private userModuleLogger: Logger;
    private readonly metadataScanner: MetadataScanner;

    constructor(
        @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>
    ) {
        this.userModuleLogger = new Logger('UserModule');
        this.metadataScanner = new MetadataScanner();
    }

    onModuleInit() {
        const resourceMap: Map<string, { resource: Resource, permissions: Permission[] }> = new Map();
        // 遍历 Module
        this.modulesContainer.forEach(value => {
            // 遍历 Module 中的 components
            value.components.forEach(value => {
                // 判断当前 component 是否是 Resolver 或 Controller
                const isResolverOrController =
                    Reflect.getMetadataKeys(value.instance.constructor)
                        .filter(key => ['graphql:resolver_type', 'path']
                            .indexOf(key) !== -1).length > 0;

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
                        if (resource) resourceMap.set(resource.identify, { resource, permissions });
                    }
                }
            });
        });

        // TODO: 删除注解集中移除的资源和权限定义
        // 保存所有扫描到的资源、权限定义
        resourceMap.forEach(value => {
            const resource = this.resourceRepo.create(value.resource);
            resource.permissions = this.permissionRepo.create(value.permissions);
            this.resourceRepo.save(resource)
                .catch(error => {
                    this.userModuleLogger.error('LoadDecorate: ' + error.detail);
                });
        });
    }
}