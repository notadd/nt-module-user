import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('source')
export class Source {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    identify: string;
}