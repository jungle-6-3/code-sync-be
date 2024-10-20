import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInRequestDto } from './dto/signin-request.dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async signUp(
    @Body() signupRequestDto: SignUpRequestDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.signUp(signupRequestDto);
    const response = new AuthResponseDto();
    if (result == true) {
      response.success = result;
      response.message = '회원가입에 성공하셨습니다.';
    }
    console.log(result);
    return response;
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
