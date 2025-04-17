import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entity/user/user.entity';

export interface UserJwt {
    id: string;
    iss: string;
    iat: number;
    exp: number;
}

export interface UserRequest extends Request {
    jwtPayload: UserJwt;
    user: User;
    token: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skipCheck = this.reflector.get<boolean>(
            'skipToken',
            context.getHandler(),
        );
        if (skipCheck === true) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();

        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new HttpException('Missing token', HttpStatus.FORBIDDEN);
        }

        try {
            let payload = await this.jwtService.verifyAsync(token);
            request['jwtPayload'] = payload;
            return true;
        } catch (error) {
            const refreshToken = request.headers['x-refresh-token'];
            if (refreshToken) {
                try {
                    const newTokens =
                        await this.authService.refreshToken(refreshToken);
                    const payload = await this.jwtService.verifyAsync(
                        newTokens.accessToken,
                    );
                    const user = await this.authService.authByJwt(payload);

                    request['user'] = user;
                    response.setHeader(
                        'x-new-access-token',
                        newTokens.accessToken,
                    );
                    request['new-access-token'] = newTokens.accessToken;
                    return true;
                } catch (refreshError) {
                    throw new HttpException(
                        'Invalid refresh token',
                        HttpStatus.FORBIDDEN,
                    );
                }
            } else {
                throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
            }
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
