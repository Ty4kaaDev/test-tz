import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    PrimaryColumn,
    Unique,
} from 'typeorm';

@Entity()
@Unique(['id'])
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refreshToken?: string | null;
}
