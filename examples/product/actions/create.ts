import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';

export const createProduct = async (
  call: grpc.ServerUnaryCall<{ id?: string; name: string; price: number; quantity: number }, any>
) => {
  const { id, name, price, quantity } = call.request;
  return await ProductService.createProduct(id, name, price, quantity);
};
