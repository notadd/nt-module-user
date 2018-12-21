import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { UserInfo } from './user-info.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    mobile: string;
    password: string;
    userInfos: UserInfo[];
    banned: boolean;
    recycle: boolean;
    roles: Role[];
    organizations: Organization[];
    createdAt: string;
    updatedAt: string;
}
