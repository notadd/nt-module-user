import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { Repository } from 'typeorm';
import { InfoGroup } from './entities/info-group.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { SystemModule } from './entities/system-module.entity';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
export declare class UserModule implements OnModuleInit {
    private readonly userService;
    private readonly modulesContainer;
    private readonly systemModuleRepo;
    private readonly resourceRepo;
    private readonly permissionRepo;
    private readonly roleRepo;
    private readonly infoGroupRepo;
    private readonly userRepo;
    private readonly metadataScanner;
    constructor(userService: UserService, modulesContainer: ModulesContainer, systemModuleRepo: Repository<SystemModule>, resourceRepo: Repository<Resource>, permissionRepo: Repository<Permission>, roleRepo: Repository<Role>, infoGroupRepo: Repository<InfoGroup>, userRepo: Repository<User>);
    static forRoot(options: {
        i18n: 'en-US' | 'zh-CN';
        authTokenWhiteList?: string[];
    }): DynamicModule;
    onModuleInit(): Promise<void>;
    private loadResourcesAndPermissions;
    private createDefaultRole;
    private createDefaultInfoGroup;
    private createSuperAdmin;
}
