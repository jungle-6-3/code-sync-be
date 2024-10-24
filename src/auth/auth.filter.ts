import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidDataException } from '../utils/validate-data-exception';
import { AuthExceptionError } from './auth.service';

@Catch(ValidDataException, AuthExceptionError)
export class AuthFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof ValidDataException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    if (exception instanceof AuthExceptionError) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
  }
}
