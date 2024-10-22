import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { validDataException } from './auth/auth.exceptions';

@Catch()
export class ExceptioGlobalFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = host.switchToHttp().getResponse();
  }
}
