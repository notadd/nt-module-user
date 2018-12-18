import { User } from './user.entity';
export declare class Organization {
    id: number;
    name: string;
    users: User[];
    parent: Organization;
    children: Organization[];
}
