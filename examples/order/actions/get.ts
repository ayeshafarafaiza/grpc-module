import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';
import { GrpcError } from '../../../src/index.js';

export const getOrder = async (call: grpc.ServerUnaryCall<{ id: string }, any>) => {
  const { id } = call.request;
  const order = await OrderRepository.getOrderById(id);

  if (!order) {
    throw new GrpcError(grpc.status.NOT_FOUND, 'Order Not Found');
  }

  return order;
};
