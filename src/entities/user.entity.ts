import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { UserInfo } from './user-info.entity';

/**
 * 用户表
 */
@Entity('user')
export class User {
    /**
     * 自增ID
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 用户名
     */
    @Column({
        unique: true
    })
    username: string;

    /**
     * 用户邮箱
     */
    @Column({
        unique: true,
        nullable: true
    })
    email: string;

    /**
     * 用户手机号
     */
    @Column({
        unique: true,
        nullable: true
    })
    mobile: string;

    /**
     * 用户登录密码
     */
    @Column()
    password: string;

    /**
     * 用户信息
     */
    @OneToMany(type => UserInfo, userInfo => userInfo.user)
    userInfos: UserInfo[];

    /**
     * 封禁状态，默认：false
     */
    @Column({
        default: false
    })
    banned: boolean;

    /**
     * 回收状态，默认：false
     */
    @Column({
        default: false
    })
    recycle: boolean;

    /**
     * 用户角色
     */
    @ManyToMany(type => Role, role => role.users, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    roles: Role[];

    /**
     * 用户所属的组织
     */
    @ManyToMany(type => Organization, organization => organization.users, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    organizations: Organization[];

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;
}