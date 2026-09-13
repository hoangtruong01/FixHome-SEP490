// src/common/exceptions/business.exception.ts
import { HttpException } from '@nestjs/common';
import { ErrorCode, ErrorCodeHttpStatus } from '../../shared/constants';

/**
 * Typed business exception that carries a machine-readable error code (P4.2).
 * The global HttpExceptionFilter reads the `code` from the response object
 * and formats it into the standard error envelope.
 *
 * Usage:
 *   throw new BusinessException(ErrorCodes.BOOKING_SUSPENDED, 'Account suspended until ...');
 *   throw new BusinessException(ErrorCodes.ORDER_INVALID_TRANSITION, msg, { from, to });
 */
export class BusinessException extends HttpException {
  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    const status = ErrorCodeHttpStatus[code] ?? 500;
    super({ code, message, details }, status);
  }
}
