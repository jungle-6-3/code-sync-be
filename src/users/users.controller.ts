import {
  Controller,
  Get,
  UseGuards,
  Request,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserInfoDTO } from './dto/user-info.response';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersFilter } from './users.filter';

@ApiTags('User API')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '로그인 채크',
    description: '로그인을 했다면, 자기 자신의 정보를 돌려준다.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({})
  authUser(@Request() req: Request & { user: JwtPayloadDto }) {
    const { email, name }: JwtPayloadDto = req.user;
    const user = new UserInfoDTO(email, name);
    return { success: true, message: '인증에 성공했습니다.', data: user };
  }
}
