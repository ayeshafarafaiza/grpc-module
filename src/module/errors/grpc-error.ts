import * as grpc from '@grpc/grpc-js';

export class GrpcError extends Error {
  public code: grpc.status;

  constructor(code: grpc.status, message: string) {
    super(message);
    this.code = code;
    this.name = 'GrpcError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static invalidArgument(message: string): GrpcError {
    return new GrpcError(grpc.status.INVALID_ARGUMENT, message);
  }

  static notFound(message: string): GrpcError {
    return new GrpcError(grpc.status.NOT_FOUND, message);
  }

  static aborted(message: string): GrpcError {
    return new GrpcError(grpc.status.ABORTED, message);
  }

  static internal(message: string): GrpcError {
    return new GrpcError(grpc.status.INTERNAL, message);
  }
}
