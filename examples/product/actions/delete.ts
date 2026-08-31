import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';
import { GrpcError } from '../../../src/index.js';
import { Logger } from '../../../src/index.js';

export const deleteProduct = async (
  call: grpc.ServerUnaryCall<{ id: string }, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { id } = call.request;
    const result = await ProductService.deleteProduct(id);
    callback(null, result);
  } catch (err) {
    if (err instanceof GrpcError) {
      callback({ code: err.code, message: err.message });
    } else {
      Logger.error('Action Error', err);
      callback({ code: grpc.status.INTERNAL, message: 'Internal Server Error' });
    }
  }
};
