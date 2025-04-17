import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Module({
    imports: [],
    controllers: [],
    providers: [AuthService, UserService],
    exports: [AuthService],
})
export class AuthModule {}
