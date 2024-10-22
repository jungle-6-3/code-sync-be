import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserInfoDTO } from './dto/user-info.response';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({})
  authUser(@Request() req: Request & { user: JwtPayloadDto }) {
    const { email, name }: JwtPayloadDto = req.user;
    const user = new UserInfoDTO(email, name);
    return { success: true, message: '인증에 성공했습니다.', data: user };
  }
}
