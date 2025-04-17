import { SetMetadata } from '@nestjs/common';

export const SkipAuth = (value = true) => SetMetadata('skipToken', value);
