import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity()
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    originalName: string;

    @Column()
    extension: string;

    @Column()
    mimeType: string;

    @Column()
    size: number;

    @CreateDateColumn()
    uploadedAt: Date;
}
