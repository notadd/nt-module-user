import { InfoGroup } from './info-group.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';
export declare class Role {
    id: number;
    name: string;
    permissions: Permission[];
    users: User[];
    infoGroup: InfoGroup;
}
//# sourceMappingURL=role.entity.d.ts.map