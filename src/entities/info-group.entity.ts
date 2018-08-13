import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { InfoItem } from './info-item.entity';
import { Role } from './role.entity';

/**
 * 信息组
 */
@Entity('info_gourp')
export class InfoGroup {
    /**
     * 自增ID
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 信息组名称
     */
    @Column({
        unique: true
    })
    name: string;

    /**
     * 信息组包含的信息项
     */
    @ManyToMany(type => InfoItem, InfoItem => InfoItem.infoGroups)
    infoItems: InfoItem[];

    /**
     * 信息组所属的角色
     */
    @OneToOne(type => Role, role => role.infoGroup, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    role: Role;
}