import { InfoItem } from './info-item.entity';
import { Role } from './role.entity';
export declare class InfoGroup {
    id: number;
    name: string;
    infoItems: InfoItem[];
    role: Role;
}
