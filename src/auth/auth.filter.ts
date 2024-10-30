import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidDataException } from '../utils/validate-data-exception';
import { GlobalHttpException } from 'src/utils/global-http-exception';

@Catch(ValidDataException, GlobalHttpException)
export class AuthFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof ValidDataException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    if (exception instanceof GlobalHttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
  }
}
