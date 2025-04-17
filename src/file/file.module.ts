import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
    controllers: [FileController],
    providers: [FileService, AuthService, UserService],
})
export class FileModule {}
