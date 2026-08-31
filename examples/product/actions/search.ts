import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';
import { GrpcError } from '../../../src/index.js';
import { Logger } from '../../../src/index.js';

export const searchProducts = async (
  call: grpc.ServerUnaryCall<{ keyword: string }, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { keyword } = call.request;
    const products = await ProductService.searchProducts(keyword);
    callback(null, { products });
  } catch (err) {
    if (err instanceof GrpcError) {
      callback({ code: err.code, message: err.message });
    } else {
      Logger.error('Action Error', err);
      callback({ code: grpc.status.INTERNAL, message: 'Internal Server Error' });
    }
  }
};
