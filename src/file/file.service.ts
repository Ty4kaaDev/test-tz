// file.service.ts
import {
    HttpException,
    HttpStatus,
    Injectable,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { FileEntity } from 'src/entity/file/file.entity';

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(FileEntity)
        private fileRepository: Repository<FileEntity>,
    ) {}

    async saveFileMetaData(file: Express.Multer.File): Promise<FileEntity> {
        const fileDb = await this.fileRepository.findOneBy({
            originalName: file.originalname,
        });
        if (fileDb) {
            throw new HttpException('File already exists', HttpStatus.CONFLICT);
        }

        const fileEntity = this.fileRepository.create({
            originalName: file.originalname,
            extension: path.extname(file.originalname).replace('.', ''),
            mimeType: file.mimetype,
            size: file.size,
        });

        const dir = path.join(__dirname, '../../uploads');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, file.originalname);
        await fs.promises.writeFile(filePath, file.buffer);

        return this.fileRepository.save(fileEntity);
    }

    async deleteFile(id: number) {
        const file = await this.fileRepository.findOneBy({ id });
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        const filePath = path.join(
            __dirname,
            '../../uploads',
            file.originalName,
        );
        await fs.promises.unlink(filePath);
        await this.fileRepository.remove(file);

        return true;
    }

    async getFileWithId(id: number) {
        const file = await this.fileRepository.findOneBy({ id });
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        return file;
    }

    async updateFile(id: number, file: Express.Multer.File) {
        let existing: FileEntity = (await this.fileRepository.findOne({
            where: { id },
        })) as FileEntity;
        if (!existing) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        const oldFilePath = path.join(
            __dirname,
            '../../uploads',
            existing.originalName,
        );
        fs.unlinkSync(oldFilePath);

        const dir = path.join(__dirname, '../../uploads');
        const filePath = path.join(dir, file.originalname);
        await fs.promises.writeFile(filePath, file.buffer);

        existing.originalName = file.originalname;
        existing.extension = path.extname(file.originalname).replace('.', '');
        existing.mimeType = file.mimetype;
        existing.size = file.size;

        return await this.fileRepository.update(id, existing);
    }

    async getFiles(page: number, listSize: number) {
        const limit = listSize;
        const skip = (page - 1) * listSize;

        // Получаем файлы с пагинацией
        const [files, total] = await this.fileRepository.findAndCount({
            take: limit,
            skip,
            order: {
                uploadedAt: 'DESC',
            },
        });

        return {
            total,
            page,
            listSize: limit,
            files,
        };
    }
}
