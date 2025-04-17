import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/entity/file/file.entity';
import { User } from 'src/entity/user/user.entity';

const Entity = [User, FileEntity];

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['./env/.env'],
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(`${process.env.DB_PORT}`),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: Entity,
            autoLoadEntities: true,
            synchronize: process.env.MODE == 'DEBUG' ? true : false,
        }),
        TypeOrmModule.forFeature(Entity),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [],
    exports: [JwtModule, TypeOrmModule.forFeature(Entity), ConfigModule],
})
export class GlobalModule {}
