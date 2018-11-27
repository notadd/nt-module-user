import { SmsComponent } from '@notadd/addon-sms';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { InfoItem } from '../entities/info-item.entity';
import { UserInfo } from '../entities/user-info.entity';
import { User } from '../entities/user.entity';
import { JwtReply } from '../interfaces/jwt.interface';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { RoleService } from './role.service';
export declare class UserService {
    private readonly userRepo;
    private readonly userInfoRepo;
    private readonly infoItemRepo;
    private readonly cryptoUtil;
    private readonly authService;
    private readonly roleService;
    private readonly smsComponentProvider;
    constructor(userRepo: Repository<User>, userInfoRepo: Repository<UserInfo>, infoItemRepo: Repository<InfoItem>, cryptoUtil: CryptoUtil, authService: AuthService, roleService: RoleService, smsComponentProvider: SmsComponent);
    createUser(createUserInput: CreateUserInput): Promise<void>;
    addUserRole(userId: number, roleId: number): Promise<void>;
    deleteUserRole(userId: number, roleId: number): Promise<void>;
    recycleOrBanUser(id: number, action: 'recycle' | 'ban'): Promise<void>;
    deleteUser(id: number): Promise<void>;
    revertBannedOrRecycledUser(id: number, status: 'recycled' | 'banned'): Promise<void>;
    updateUserInfo(id: number, updateUserInput: UpdateUserInput): Promise<void>;
    findByRoleId(roleId: number): Promise<UserInfoData[]>;
    findByOrganizationId(organizationId: number): Promise<UserInfoData[]>;
    findOneWithRolesAndPermissions(loginName: string): Promise<User>;
    findUserInfoById(id: number | number[]): Promise<UserInfoData | UserInfoData[]>;
    findOneWithInfoItemsByRoleIds(roleIds: number[]): Promise<InfoItem[]>;
    login(loginName: string, password: string): Promise<{
        tokenInfo: JwtReply;
        userInfoData: UserInfoData;
    }>;
    mobileLogin(mobile: string, validationCode: number): Promise<{
        tokenInfo: JwtReply;
        userInfoData: UserInfoData;
    }>;
    register(createUserInput: CreateUserInput): Promise<void>;
    private checkUserStatus;
    private findOneById;
    private createOrUpdateUserInfos;
    private refactorUserData;
}
//# sourceMappingURL=user.service.d.ts.map