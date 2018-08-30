import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { InfoGroup } from './info-group.entity';
import { UserInfo } from './user-info.entity';

@Entity('info_item')
export class InfoItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @Column()
    description: string;

    @Column()
    type: string;

    @Column()
    registerDisplay: boolean;

    @Column()
    informationDisplay: boolean;

    @Column()
    order: number;

    @OneToMany(type => UserInfo, userInfo => userInfo.infoItem)
    userInfos: UserInfo[];

    @ManyToMany(type => InfoGroup, infoGroup => infoGroup.infoItems, {
        onDelete: 'CASCADE'
    })
    @JoinTable()
    infoGroups: InfoGroup[];
}