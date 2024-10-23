import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidDataException } from './validate-exceptions';

/**
 * catch class-validator exception
 * Define a custom error type ex)authError
 * useage : UsePipe(ValidateGlobalPipe(authError))
 */
@Injectable()
export class ValidateGlobalPipe implements PipeTransform {
  private errorType;
  constructor(errorType) {
    this.errorType = errorType;
  }
  async transform(value: any, metadata: ArgumentMetadata) {
    const validPipe = new ValidationPipe({
      disableErrorMessages: true,
      exceptionFactory: (error: ValidationError[]) => {
        const properties = error.map((error) => error.property);
        const { code, message } = this.errorType[properties[0]];
        throw new ValidDataException(message, code);
      },
    });
    const requestValue = await validPipe.transform(value, metadata);
    return requestValue;
  }
}
