import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async updateToken(user: User, token: string) {
        await this.userRepository.update(user.id, { refreshToken: token });
    }

    async findOneUser(key: string, value: string): Promise<User> {
        const validColumns = this.userRepository.metadata.columns.map(
            (col) => col.propertyName,
        );
        if (!validColumns.includes(key)) {
            throw new Error(`Invalid column name: ${key}`);
        }

        const [user] = await this.userRepository.query(
            `SELECT * FROM \`${this.userRepository.metadata.tableName}\` WHERE \`${key}\` = ? LIMIT 1`,
            [value],
        );

        return user;
    }

    async logout(user: User) {
        await this.userRepository.update(user.id, { refreshToken: null });
    }

    async createUser(user: User) {
        return await this.userRepository.save(user);
    }

    async save(user: User) {
        return await this.userRepository.save(user);
    }
}
