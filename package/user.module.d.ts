import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { EntityManager, Repository } from 'typeorm';
import { InfoGroup } from './entities/info-group.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
export declare class UserModule implements OnModuleInit {
    private readonly userService;
    private readonly modulesContainer;
    private readonly entityManager;
    private readonly resourceRepo;
    private readonly permissionRepo;
    private readonly roleRepo;
    private readonly infoGroupRepo;
    private readonly userRepo;
    private readonly metadataScanner;
    constructor(userService: UserService, modulesContainer: ModulesContainer, entityManager: EntityManager, resourceRepo: Repository<Resource>, permissionRepo: Repository<Permission>, roleRepo: Repository<Role>, infoGroupRepo: Repository<InfoGroup>, userRepo: Repository<User>);
    static forRoot(options: {
        i18n: 'en-US' | 'zh-CN';
    }): DynamicModule;
    onModuleInit(): Promise<void>;
    private loadResourcesAndPermissions;
    private createDefaultRole;
    private createDefaultInfoGroup;
    private createSuperAdmin;
}
//# sourceMappingURL=user.module.d.ts.map