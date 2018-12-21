import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { configure as i18nConfigure } from 'i18n';
import { Repository } from 'typeorm';

import { InfoGroupGrpcController } from './controllers/info-group.grpc.controller';
import { InfoItemGrpcController } from './controllers/info-item.grpc.controller';
import { OrganizationGrpcController } from './controllers/organization.grpc.controller';
import { ResourceGrpcController } from './controllers/resource.grpc.controller';
import { RoleGrpcController } from './controllers/role.grpc.controller';
import { SystemModuleGrpcController } from './controllers/system.module.controller';
import { UserGrpcController } from './controllers/user.grpc.controller';
import { InfoGroup } from './entities/info-group.entity';
import { InfoItem } from './entities/info-item.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { PersonalPermission } from './entities/personal-permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { SystemModule } from './entities/system-module.entity';
import { UserInfo } from './entities/user-info.entity';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { EntityCheckService } from './services/entity-check.service';
import { InfoGroupService } from './services/info-group.service';
import { InfoItemService } from './services/info-item.service';
import { OrganizationService } from './services/organization.service';
import { ResourceService } from './services/resource.service';
import { RoleService } from './services/role.service';
import { SystemModuleService } from './services/system-module.service';
import { UserService } from './services/user.service';
import { CryptoUtil } from './utils/crypto.util';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '123456',
            database: 'module_user',
            entities: [__dirname + '/**/*.entity.ts'],
            logger: 'advanced-console',
            logging: true,
            synchronize: true,
            dropSchema: false
        }),
        TypeOrmModule.forFeature([Organization, User, Role, SystemModule, Resource, Permission, PersonalPermission, InfoGroup, InfoItem, UserInfo])
    ],
    controllers: [
        InfoGroupGrpcController,
        InfoItemGrpcController,
        OrganizationGrpcController,
        SystemModuleGrpcController,
        ResourceGrpcController,
        RoleGrpcController,
        UserGrpcController
    ],
    providers: [
        AuthService,
        EntityCheckService,
        OrganizationService,
        UserService,
        RoleService,
        SystemModuleService,
        ResourceService,
        InfoGroupService,
        InfoItemService,
        CryptoUtil
    ],
    exports: []
})
export class UserModule implements OnModuleInit {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(InfoGroup) private readonly infoGroupRepo: Repository<InfoGroup>,
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) { }

    static forRoot(options: { i18n: 'en-US' | 'zh-CN' }): DynamicModule {
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
        await this.createDefaultRole();
        await this.createDefaultInfoGroup();
        await this.createSuperAdmin();
    }

    /**
     * Create a default ordinary user role
     */
    private async createDefaultRole() {
        const defaultRole = await this.roleRepo.findOne(1);

        if (defaultRole) return;

        await this.roleRepo.save(this.roleRepo.create({
            id: 1,
            name: 'ordinary user'
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
            name: 'ordinary user information group',
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