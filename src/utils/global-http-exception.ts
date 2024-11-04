import { HttpException, HttpStatus } from '@nestjs/common';

export class GlobalHttpException extends HttpException {
  constructor(message: string, code: string, status: HttpStatus) {
    super(
      {
        success: false,
        status: status,
        code,
        message,
      },
      status,
    );
  }
}
