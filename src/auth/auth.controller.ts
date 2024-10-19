import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login-request.dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private autService: AuthService) {}

  @ApiOperation({
    summary: '로그인',
    description: '로그인을 요청한다. 아이디와 패스워드를 입력받는다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인성공',
    type: AuthResponseDto,
  })
  @Post('signin')
  signIn(@Body() loginRequestDto: LoginRequestDto): AuthResponseDto {
    return;
  }

  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃한다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃',
    type: AuthResponseDto,
  })
  @Post('logout')
  logOut(): AuthResponseDto {
    return;
  }

  @ApiOperation({
    summary: '회원가입',
    description: '회원가입을한다. 이름, 이메일, 패스워드를 입력받는다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원가입',
    type: AuthResponseDto,
  })
  @Post('signUp')
  signUp(@Body() signupRequestDto: SignUpRequestDto): AuthResponseDto {
    return;
  }

  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴를한다.',
  })
  @ApiResponse({
    status: 200,
    description: '탈퇴성공',
    type: AuthResponseDto,
  })
  @Delete()
  withdraw(): AuthResponseDto {
    return;
  }
}
