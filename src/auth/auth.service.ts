import { Injectable } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth.response.dto';
import { UsersService } from 'src/users/users.service';
import { SignInRequestDto } from './dto/signin-request.dto';
import { SignUpRequestDto } from './dto/signup-request.dto';
import { ValidationError } from 'class-validator';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signIn(signInRequestDto: SignInRequestDto) {
    const { email, password } = signInRequestDto;
    const user = await this.userService.findOne(email);
    console.log(user);
    if (!user) {
      console.log("user info null")
      return false;
    }
    if(!await bcrypt.compare(password, user.hashedPassword)){
      console.log("password false")
    }
    console.log("correct password")
    //패스워드 맞는지 확인
    

    return;
  }

  async signUp(signUpRequestDto: SignUpRequestDto) {
    return await this.userService.createUser(signUpRequestDto);
  }

  logOut() {}

  withdraw() {}
}
