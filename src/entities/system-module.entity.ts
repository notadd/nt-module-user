import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from './resource.entity';

@Entity('system_module')
export class SystemModule {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Resource, resource => resource.systemModule)
    resources: Resource[];
}