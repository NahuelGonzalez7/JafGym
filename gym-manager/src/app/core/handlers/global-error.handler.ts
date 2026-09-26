import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorLoggerService } from '../services/error-logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  private logger = inject(ErrorLoggerService);

  handleError(error: Error): void {
    this.logger.log(error, 'GlobalErrorHandler');
  }
}