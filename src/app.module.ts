import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { User } from './entity/user/user.entity';
import { GlobalModule } from './global/global.module';
import { AuthService } from './auth/auth.service';

export const Entity = [User];

@Module({
    imports: [AuthModule, UserModule, FileModule, GlobalModule],
    controllers: [AppController],
    providers: [AppService, AuthService],
})
export class AppModule {
    constructor() {}
}
