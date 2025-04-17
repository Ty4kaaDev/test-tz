import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entity/user/user.entity';
import { UserJwt, UserRequest } from 'src/global/guards/auth.guard';
import { SignInDTO, SignUpDTO } from 'src/types/dto/user';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signUp(body: SignUpDTO) {
        let user = await this.userService.findOneUser('id', body.id);
        if (user) {
            throw new HttpException('id already used', HttpStatus.CONFLICT);
        }

        const hashPassword = await bcrypt.hash(body.password, 10);

        user = {
            id: body.id,
            password: hashPassword,
        };

        await this.userService.createUser(user);
        return true;
    }

    async signIn(body: SignInDTO) {
        let user = await this.userService.findOneUser('id', body.id);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(
            body.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new HttpException('Invalid password', HttpStatus.FORBIDDEN);
        }

        return this.generateTokens(user);
    }

    async authByJwt(jwt: UserJwt) {
        const user = await this.userService.findOneUser('id', jwt.id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async refreshToken(refreshToken: string) {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: process.env.REFRESH_SECRET,
        });

        const user = await this.userService.findOneUser('id', payload.id);
        if (!user) {
            throw new HttpException(
                'Invalid refresh token',
                HttpStatus.FORBIDDEN,
            );
        }
        if (refreshToken !== user.refreshToken) {
            throw new HttpException(
                'Invalid refresh token',
                HttpStatus.FORBIDDEN,
            );
        }

        await this.userService.updateToken(user, refreshToken);

        const { accessToken, refreshToken: newRefreshToken } =
            this.generateTokens(user);
        return { accessToken, refreshToken: newRefreshToken };
    }

    private generateTokens(user: User) {
        const accessToken = this.jwtService.sign(
            { id: user.id },
            {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRATION,
            },
        );

        const refreshToken = this.jwtService.sign(
            { id: user.id },
            {
                secret: process.env.REFRESH_SECRET,
                expiresIn: process.env.REFRESH_EXPIRATION,
            },
        );

        return { accessToken, refreshToken };
    }
}
