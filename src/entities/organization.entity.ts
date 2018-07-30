import { Entity, Tree, TreeParent, TreeChildren } from 'typeorm';

@Tree('closure-table')
@Entity('organization')
export class Organization {
    id: number;

    name: string;

    @TreeParent()
    parent: Organization;

    @TreeChildren()
    children: Organization[];
}