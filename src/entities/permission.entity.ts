import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from './resource.entity';
import { Role } from './role.entity';

@Entity('permission')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => Resource, resource => resource.permissions, {
        onDelete: 'CASCADE'
    })
    resource: Resource;

    @Column()
    action: string;

    @Column({
        unique: true
    })
    identify: string;

    @ManyToMany(type => Role, role => role.permissions)
    roles: Role[];
}