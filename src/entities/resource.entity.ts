import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';

/**
 * 资源实体，一个资源对应多个权限
 */
@Entity()
export class Resource {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 资源名称
     */
    @Column()
    name: string;

    /**
     * 描述
     */
    @Column()
    description: string;

    /**
     * 资源下对应的权限
     */
    @OneToMany(type => Permission, permission => permission.resource)
    permissions: Permission[];
}