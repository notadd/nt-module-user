import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

import { User } from './user.entity';

@Entity('organization')
@Tree('closure-table')
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(type => User, user => user.organizations)
    users: User[];

    @TreeParent()
    parent: Organization;

    @TreeChildren({ cascade: true })
    children: Organization[];
}