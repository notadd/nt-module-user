import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Resource } from './resource.entity';

@Entity('system_module')
export class SystemModule {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Resource, resource => resource.systemModule)
    resources: Resource[];
}