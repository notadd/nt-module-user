import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { InfoGroup } from './info-group.entity';
import { UserInfo } from './user-info.entity';

/**
 * 用户信息项表
 */
@Entity('info_item')
export class InfoItem {
    /**
     * 自增ID
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 信息项名称
     */
    @Column({
        unique: true
    })
    name: string;

    /**
     * 信息项标签
     */
    @Column()
    label: string;

    /**
     * 信息项描述
     */
    @Column()
    description: string;

    /**
     * 信息项类型
     */
    @Column()
    type: string;

    /**
     * 用户信息项对应的值
     */
    @OneToOne(type => UserInfo, userInfo => userInfo.infoItem)
    userInfo: UserInfo;

    /**
     * 信息项所属的信息组
     */
    @ManyToMany(type => InfoGroup, infoGroup => infoGroup.infoItems, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    infoGroups: InfoGroup[];
}