import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('personal_permission')
export class PersonalPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.personalPermissions)
    user: User;

    @OneToOne(type => Permission)
    @JoinColumn()
    permission: Permission;

    /**
     * personal permission status, 0 is been deleted, 1 is been added.
     */
    @Column()
    status: number;
}