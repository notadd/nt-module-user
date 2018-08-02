import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from './resource.entity';
import { Role } from './role.entity';

/**
 * 权限实体，对应resolver下的每一个method
 */
@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 权限名称
     */
    @Column()
    name: string;

    /**
     * 权限所属的资源
     */
    @ManyToOne(type => Resource, resource => resource.permissions)
    resource: Resource;

    /**
     * 对应的操作(browse、create、update、delete)
     */
    @Column()
    action: string;

    /**
     * 权限的唯一标识
     */
    @Column()
    identify: string;

    /**
     * 是否私人资源
     */
    @Column()
    personal: boolean;

    /**
     * 拥有权限的角色
     */
    @ManyToMany(type => Role, role => role.permissions)
    roles: Role[];
}