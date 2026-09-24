import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || 'An error occurred';
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as any).code === 'P2002'
    ) {
      status = HttpStatus.CONFLICT;
      const target = (exception as any).meta?.target;
      const field = Array.isArray(target) ? target.join(', ') : target || 'field';
      message = `A record with this ${field} already exists. Please choose a different ${field}.`;
    } else {
       // Log non-http exceptions for debugging
       console.error(exception);
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
