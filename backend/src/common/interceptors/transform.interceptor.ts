import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    totalPage?: number;
    total?: number;
    limit?: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<any>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<any>> {
    return next.handle().pipe(
      map((data) => {
        let result: any = {
          success: true,
          message: data?.message || 'Request successful',
          data: data,
        };

        // If the data is an object and contains pagination info
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const { pagination, message, ...rest } = data;

          if (pagination) {
            // Find the main data array (e.g., 'products', 'categories', 'orders')
            const dataKey = Object.keys(rest).find((key) => Array.isArray(rest[key]));
            
            result.data = dataKey ? rest[dataKey] : rest;
            result.meta = {
              page: pagination.page,
              totalPage: pagination.totalPages || pagination.totalPage,
              total: pagination.total,
              limit: pagination.limit,
            };
          } else if (message) {
             // If there was a message, use it and set data to the rest
             result.message = message;
             result.data = Object.keys(rest).length === 1 ? Object.values(rest)[0] : rest;
          }
        }

        return result;
      }),
    );
  }
}
