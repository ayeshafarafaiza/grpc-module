import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';
import { GrpcError } from '../../../src/index.js';
import { Logger } from '../../../src/index.js';

export const getAllProduct = async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
  console.log('\n[PRODUCT] Received getAllProduct request');
  console.log('[PRODUCT] Returning product list...');
  try {
    const products = await ProductService.getAllProducts();
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
