import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidDataException } from '../utils/validate-data-exception';

@Catch(ValidDataException)
export class AuthFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof ValidDataException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
  }
}
