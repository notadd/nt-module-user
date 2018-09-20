import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './permission.entity';
import { SystemModule } from './system-module.entity';

@Entity('resource')
export class Resource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        unique: true
    })
    identify: string;

    @OneToMany(type => Permission, permission => permission.resource)
    permissions: Permission[];

    @ManyToOne(type => SystemModule, systemModule => systemModule.resources, {
        onDelete: 'CASCADE'
    })
    systemModule: SystemModule;
}