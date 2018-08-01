import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    identify: string;

    @Column()
    action: string;

    @Column()
    personal: boolean;
}