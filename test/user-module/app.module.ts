import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PERMISSION_DEFINITION } from '../decorators/permission.decorator.test';
import { SOURCE_DEFINITION } from '../decorators/source.decorator.test';
import { Permission } from './entities/permission.entity';
import { Source } from './entities/source.entity';
import { UserModule } from './modules/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Source, Permission]),
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
        @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,

    ) {
        this.metadataScanner = new MetadataScanner();
    }

    onModuleInit() {
        const sourceMap = new Map();
        const permissionMap = new Map();
        this.modulesContainer.forEach(value => {
            value.components.forEach(value => {
                const source = Reflect.getMetadata(SOURCE_DEFINITION, value.instance.constructor);
                if (source) sourceMap.set(source.identify, source);
                const prototype = Object.getPrototypeOf(value.instance);
                if (prototype) {
                    this.metadataScanner.scanFromPrototype(value.instance, prototype, name => {
                        const permission = Reflect.getMetadata(PERMISSION_DEFINITION, value.instance, name);
                        if (permission) permissionMap.set(permission.identify, permission);
                    });
                }
            });
        });
        // console.log(sourceMap);
        // console.log(permissionMap);
        sourceMap.forEach(source => {
            this.sourceRepo.save(this.sourceRepo.create(source));
        });

        permissionMap.forEach(permission => {
            this.permissionRepo.save(this.permissionRepo.create(permission));
        });
    }
}