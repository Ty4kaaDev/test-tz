import {
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { PaginationDTO } from 'src/types/dto/global';
import { AuthGuard, UserRequest } from 'src/global/guards/auth.guard';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@UseGuards(AuthGuard)
@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const savedFile = await this.fileService.saveFileMetaData(file);
        return {
            file: savedFile,
        };
    }

    @Delete('/delete/:id')
    async deleteFile(@Param('id') id: string) {
        const file = await this.fileService.getFileWithId(parseInt(id));
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        return await this.fileService.deleteFile(parseInt(id));
    }

    @Get('/list')
    async getFiles(@Query() query: PaginationDTO) {
        const { page = 1, listSize = 10 } = query;
        return await this.fileService.getFiles(page, listSize);
    }

    @Get('/:id')
    async getFileWithId(@Param('id') id: string) {
        const file = await this.fileService.getFileWithId(parseInt(id));
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        return await this.fileService.getFileWithId(parseInt(id));
    }

    @Get('download/:id')
    async downloadFile(@Param('id') id: string, @Res() res: Response) {
        const file = await this.fileService.getFileWithId(parseInt(id));
        if (!file) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        const filePath = path.join(
            __dirname,
            '..',
            '..',
            'uploads',
            file.originalName,
        );
        if (!fs.existsSync(filePath)) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        res.download(filePath, file.originalName);
    }

    @Put('/update/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateFile(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.fileService.updateFile(parseInt(id), file);
    }

    @Get('/logout')
    async logout(@Req() request: UserRequest) {
        return;
    }
}
