import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationDTO {
    @IsNumberString()
    @IsOptional()
    listSize: number;

    @IsNumberString()
    @IsOptional()
    page: number;
}
