import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

/**
 * 角色实体
 */
@Entity()
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
    @ManyToMany(type => Permission)
    permissions: Permission[];

    /**
     * 拥有角色的用户
     */
    @ManyToMany(type => User)
    users: User[];
}