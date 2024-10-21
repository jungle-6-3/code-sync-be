import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth.response.dto';
import { UsersService } from 'src/users/users.service';
import { SignInRequestDto } from './dto/signin-request.dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { ValidationError } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInRequestDto: SignInRequestDto) {
    const { email, password } = signInRequestDto;
    const user = await this.userService.findOne(email);

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new AuthExceptionError('아이디 또는 비밀번호가 틀립니다.');
    }
    const payload = { sub: user.email, username: user.name };
    const access_token = await this.jwtService.sign(payload);
    return access_token;
  }

  async signUp(signUpRequestDto: SignUpRequestDto) {
    const password = signUpRequestDto.password;
    // 비밀번호 해쉬화
    const hashedPassword = await this.hashingPasswd(password);
    signUpRequestDto.password = hashedPassword;
    const userData = await this.userService.createUser(signUpRequestDto);
    if (!userData) {
      throw new AuthExceptionError('회원가입에 실패하였습니다.');
    }
  }
  // 패스워드 해쉬 함수
  private async hashingPasswd(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  withdraw() {}
}

class AuthExceptionError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
