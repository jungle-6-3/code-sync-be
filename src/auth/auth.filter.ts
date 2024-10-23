import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidDataException } from '../utils/validate-exceptions';

@Catch()
export class AuthFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (exception instanceof ValidDataException) {
      const response = host.switchToHttp().getResponse();
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    if (exception instanceof UnauthorizedException) {
      const errorMessage = {
        success: false,
        status: 401,
        code: 'AUTH_11',
        message: '유효하지않은 토큰',
      };
      response.status(401).json(errorMessage);
    }
  }
}
