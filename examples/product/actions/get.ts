import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';

export const getProduct = async (call: grpc.ServerUnaryCall<{ id: string }, any>) => {
  const { id } = call.request;
  return await ProductService.getProductById(id);
};
