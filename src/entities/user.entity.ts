import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Organization } from './organization.entity';
import { Role } from './role.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
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

    @ManyToMany(type => Role, role => role.users)
    @JoinTable()
    roles: Role[];

    /**
     * 用户所属的组织
     */
    @ManyToMany(type => Organization, organization => organization.users)
    @JoinTable()
    organizations: Organization[];

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;
}