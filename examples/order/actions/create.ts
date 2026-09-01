import * as grpc from '@grpc/grpc-js';
import { OrderService } from '../services/order.service.js';

export const createNewOrder = async (
  call: grpc.ServerUnaryCall<{ items: { productId: string; quantity: number }[] }, any>
) => {
  const { items } = call.request;
  return await OrderService.createOrder(items);
};
