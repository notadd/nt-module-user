import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('resource')
export class Resource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    identify: string;
}