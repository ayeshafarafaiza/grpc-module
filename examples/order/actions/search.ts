import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';
import { GrpcError } from '../../../src/index.js';

export const searchOrder = async (call: grpc.ServerUnaryCall<{ keyword: string }, any>) => {
  const { keyword } = call.request;
  if (!keyword) {
    throw new GrpcError(grpc.status.INVALID_ARGUMENT, 'Keyword is required');
  }

  const orders = await OrderRepository.searchOrders(keyword);
  return { orderList: orders };
};
