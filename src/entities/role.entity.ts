import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { InfoGroup } from './info-group.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('role')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @ManyToMany(type => Permission, permission => permission.roles, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    permissions: Permission[];

    @ManyToMany(type => User, user => user.roles)
    users: User[];

    @OneToOne(type => InfoGroup, infoGroup => infoGroup.role)
    infoGroup: InfoGroup;
}