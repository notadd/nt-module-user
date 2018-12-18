import { Resource } from './resource.entity';
import { Role } from './role.entity';
export declare class Permission {
    id: number;
    name: string;
    resource: Resource;
    action: string;
    identify: string;
    roles: Role[];
}
