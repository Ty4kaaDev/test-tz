import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SignInDTO, SignUpDTO } from './types/dto/user';
import { AuthGuard, UserRequest } from './global/guards/auth.guard';
import { AuthService } from './auth/auth.service';
import { SkipAuth } from './global/decorators/skip.decorator';
import { UserService } from './user/user.service';

@Controller()
@UseGuards(AuthGuard)
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @SkipAuth()
    @Post('/signup')
    async signup(@Body() body: SignUpDTO) {
        return await this.authService.signUp(body);
    }

    @SkipAuth()
    @Post('/signin')
    async signin(@Body() body: SignInDTO) {
        return await this.authService.signIn(body);
    }

    @Post('/signin/new-token')
    async newToken(@Req() request: UserRequest) {
        const token = request.headers['x-refresh-token'];
        if (!token) {
            throw new HttpException(
                'Missing refresh token',
                HttpStatus.FORBIDDEN,
            );
        }
        return await this.authService.refreshToken(token as string);
    }

    @Get('/info')
    async getInfo(@Req() request: UserRequest) {
        return request.user.id;
    }

    @Get('/logout')
    async logout(@Req() request: UserRequest) {
        return await this.userService.logout(request.user);
    }
}
