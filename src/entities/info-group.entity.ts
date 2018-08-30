import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { InfoItem } from './info-item.entity';
import { Role } from './role.entity';

@Entity('info_gourp')
export class InfoGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @ManyToMany(type => InfoItem, InfoItem => InfoItem.infoGroups)
    infoItems: InfoItem[];

    @OneToOne(type => Role, role => role.infoGroup, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    role: Role;
}