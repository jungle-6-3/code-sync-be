import { HttpException, HttpStatus } from '@nestjs/common';

export class GlobalHttpException extends HttpException {
  constructor(message: string, code: string, status?: HttpStatus) {
    super(
      {
        success: false,
        status: status || HttpStatus.BAD_REQUEST,
        code,
        message,
      },
      status || HttpStatus.BAD_REQUEST,
    );
  }
}
