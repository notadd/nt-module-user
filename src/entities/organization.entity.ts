import { Entity, Tree, TreeParent, TreeChildren, PrimaryGeneratedColumn, Column } from 'typeorm';

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