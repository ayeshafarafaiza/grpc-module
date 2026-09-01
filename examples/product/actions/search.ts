import * as grpc from '@grpc/grpc-js';
import { ProductService } from '../services/product.service.js';

export const searchProducts = async (call: grpc.ServerUnaryCall<{ keyword: string }, any>) => {
  const { keyword } = call.request;
  const products = await ProductService.searchProducts(keyword);
  return { products };
};
