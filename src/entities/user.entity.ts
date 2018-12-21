import moment from 'moment';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { Organization } from './organization.entity';
import { PersonalPermission } from './personal-permission.entity';
import { Role } from './role.entity';
import { UserInfo } from './user-info.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        nullable: true
    })
    username: string;

    @Column({
        unique: true,
        nullable: true
    })
    email: string;

    @Column({
        unique: true,
        nullable: true
    })
    mobile: string;

    @Column()
    password: string;

    @OneToMany(type => UserInfo, userInfo => userInfo.user)
    userInfos: UserInfo[];

    @Column({
        default: false
    })
    banned: boolean;

    @Column({
        default: false
    })
    recycle: boolean;

    @ManyToMany(type => Role, role => role.users, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    roles: Role[];

    @OneToMany(type => PersonalPermission, personalPermission => personalPermission.user)
    personalPermissions: PersonalPermission[];

    @ManyToMany(type => Organization, organization => organization.users, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    organizations: Organization[];

    @CreateDateColumn({
        transformer: {
            from: (date: Date) => {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            },
            to: () => {
                return new Date();
            }
        }
    })
    createdAt: string;

    @UpdateDateColumn({
        transformer: {
            from: (date: Date) => {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            },
            to: () => {
                return new Date();
            }
        }
    })
    updatedAt: string;
}