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
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 打印实际错误到控制台
    if (!(exception instanceof HttpException)) {
      console.error('Unhandled Exception:', exception);
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : '服务器内部错误';

    // 开发模式返回详细错误信息
    const errorDetail = !(exception instanceof HttpException)
      ? {
          error: exception?.message || 'Unknown error',
          stack: exception?.stack?.split('\n').slice(0, 5)
        }
      : undefined;

    response.status(status).json({
      code: status,
      message,
      timestamp: new Date().toISOString(),
      detail: errorDetail,
    });
  }
}
