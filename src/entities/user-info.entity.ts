import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { InfoItem } from './info-item.entity';
import { User } from './user.entity';

@Entity('user_info')
export class UserInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value: string;

    @ManyToOne(type => User, user => user.userInfos, {
        onDelete: 'CASCADE'
    })
    user: User;

    @ManyToOne(type => InfoItem, infoItem => infoItem.userInfos, {
        onDelete: 'CASCADE'
    })
    infoItem: InfoItem;
}