import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { InfoGroup } from './info-group.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

/**
 * 角色实体
 */
@Entity('role')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 角色名称
     */
    @Column()
    name: string;

    /**
     * 角色拥有的权限
     */
    @ManyToMany(type => Permission, permission => permission.roles)
    @JoinTable()
    permissions: Permission[];

    /**
     * 拥有角色的用户
     */
    @ManyToMany(type => User, user => user.roles)
    users: User[];

    /**
     * 角色对应的信息组
     */
    @ManyToMany(type => InfoGroup, infoGroup => infoGroup.roles)
    infoGroups: InfoGroup[];
}