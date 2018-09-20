import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from './resource.entity';

@Entity('system_module')
export class SystemModule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Resource, resource => resource.systemModule)
    resources: Resource[];
}