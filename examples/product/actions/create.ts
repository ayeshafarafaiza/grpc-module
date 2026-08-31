import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';
import { GrpcError } from '../../../src/index.js';
import { Logger } from '../../../src/index.js';

export const createProduct = async (
  call: grpc.ServerUnaryCall<{ id?: string; name: string; price: number; quantity: number }, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { id, name, price, quantity } = call.request;
    const product = await ProductService.createProduct(id, name, price, quantity);
    callback(null, product);
  } catch (err) {
    if (err instanceof GrpcError) {
      callback({ code: err.code, message: err.message });
    } else {
      Logger.error('Action Error', err);
      callback({ code: grpc.status.INTERNAL, message: 'Internal Server Error' });
    }
  }
};
