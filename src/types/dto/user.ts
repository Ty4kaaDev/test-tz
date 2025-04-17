import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailOrPhone } from 'src/validation/email-or-phone.validator';

export class SignUpDTO {
    @IsNotEmpty()
    @IsEmailOrPhone()
    id: string;

    @IsNotEmpty()
    @IsString() // @IsStrongPassword()
    password: string;
}

export class SignInDTO {
    @IsNotEmpty()
    @IsEmailOrPhone()
    id: string;

    @IsNotEmpty()
    @IsString() // @IsStrongPassword()
    password: string;
}
