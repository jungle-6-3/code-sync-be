import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidDataException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        code,
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
