import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';
import { GrpcError } from '../../../src/index.js';

export const deleteOrder = async (call: grpc.ServerUnaryCall<{ id: string }, any>) => {
  const { id } = call.request;
  const success = await OrderRepository.deleteOrder(id);

  if (success) {
    return { success: true, message: 'Order successfully deleted' };
  } else {
    throw new GrpcError(grpc.status.NOT_FOUND, 'Order not found');
  }
};
