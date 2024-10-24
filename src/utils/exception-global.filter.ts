import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

@Catch()
export class ExceptionGlobalFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof UnauthorizedException) {
      const errorMessage = {
        success: false,
        status: 401,
        code: 'AUTH_11',
        message: '유효하지않은 토큰',
      };
      response.status(401).json(errorMessage);
      return;
    }
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log(exception);
    const errorMessage = {
      success: false,
      status: 401,
      code: '???',
      message: '백앤드를 불러주세요',
    };
    response.status(status).json(errorMessage);
    return;
  }
}
