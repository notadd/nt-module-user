import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './permission.entity';

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
}