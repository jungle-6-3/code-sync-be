import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInRequestDto } from './dto/signin-request.dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ValidateGlobalPipe } from '../utils/validate-global.pipe';
import { authError } from './auth.error';
import { AuthFilter } from './auth.filter';

@ApiTags('Auth API')
@Controller('auth')
@UsePipes(new ValidateGlobalPipe(authError))
@UseFilters(new AuthFilter())
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
  async signIn(
    @Body() loginRequestDto: SignInRequestDto,
    @Res() res: Response,
  ) {
    const access_token = await this.authService.signIn(loginRequestDto);
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: +process.env.COOKIE_AGE,
    });
    return res.send({
      success: true,
      message: '로그인에 성공하였습니다.',
    });
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
  @UseGuards(JwtAuthGuard)
  logOut(@Req() req: Request, @Res() res: Response) {
    // res.cookie('token', '', { maxAge: 0 });
    res.clearCookie('token');

    return res.send({
      message: 'success',
    });
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
    return { success: true, message: '회원가입에 성공하셨습니다.' };
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
  deleteUser(): AuthResponseDto {
    return;
  }
}
