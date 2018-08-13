import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { InfoItem } from './info-item.entity';
import { User } from './user.entity';

/**
 * 用户信息表，存放用户所有信息项的值
 */
@Entity('user_info')
export class UserInfo {
    /**
     * 自增ID
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 信息项的值
     */
    @Column()
    value: string;

    /**
     * 所属用户
     */
    @ManyToOne(type => User, user => user.userInfos, {
        onDelete: 'CASCADE'
    })
    user: User;

    /**
     * 所属信息项
     */
    @OneToOne(type => InfoItem, infoItem => infoItem.userInfo, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    infoItem: InfoItem;
}