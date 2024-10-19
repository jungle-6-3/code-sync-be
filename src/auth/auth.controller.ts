import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {}
