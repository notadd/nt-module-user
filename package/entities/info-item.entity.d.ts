import { InfoGroup } from './info-group.entity';
import { UserInfo } from './user-info.entity';
export declare class InfoItem {
    id: number;
    name: string;
    description: string;
    type: string;
    registerDisplay: boolean;
    informationDisplay: boolean;
    order: number;
    userInfos: UserInfo[];
    infoGroups: InfoGroup[];
}
//# sourceMappingURL=info-item.entity.d.ts.map