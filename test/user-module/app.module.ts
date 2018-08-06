import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PERMISSION_DEFINITION } from './decorators/permission.decorator.test';
import { RESOURCE_DEFINITION } from './decorators/resource.decorator.test';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { UserModule } from './modules/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Resource, Permission]),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'postgres',
            entities: [__dirname + '/./*/*.entity.ts'],
            synchronize: true,
            dropSchema: true,
            logging: true
        }),
        UserModule
    ]
})
export class AppModule implements OnModuleInit {
    private readonly metadataScanner: MetadataScanner;

    constructor(
        @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,

    ) {
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

        // 保存所有扫描到的资源、权限定义
        resourceMap.forEach(value => {
            const resource = this.resourceRepo.create(value.resource);
            resource.permissions = this.permissionRepo.create(value.permissions);
            this.resourceRepo.save(resource);
        });
    }
}