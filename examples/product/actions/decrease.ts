import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';

export const decreaseProductQuantity = async (call: grpc.ServerUnaryCall<{ id: string; quantity: number }, any>) => {
  const { id, quantity } = call.request;
  return await ProductService.decreaseQuantity(id, quantity);
};
