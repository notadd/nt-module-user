import { Entity, Tree, TreeParent, TreeChildren, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Tree('closure-table')
@Entity('organization')
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 组织名称
     */
    @Column()
    name: string;

    /**
     * 组织下的用户
     */
    @ManyToMany(type => User)
    @JoinTable()
    users: User[]

    /**
     * 父组织
     */
    @TreeParent()
    parent: Organization;

    /**
     * 子组织
     */
    @TreeChildren()
    children: Organization[];
}