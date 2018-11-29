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
     * personal permission status.
     *
     * increase means it is been added from user's current permission.
     *
     * decrease means it is been deleted to user's current permission.
     */
    @Column()
    status: 'increase' | 'decrease';
}