import { Logger } from '../../../src/index.js';
import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';

export const deleteOrder = async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
  try {
    const { id } = call.request;
    const success = await OrderRepository.deleteOrder(id);

    if (success) {
      callback(null, { success: true, message: 'Order successfully deleted' });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Order not found'
      });
    }
  } catch (err) {
    Logger.error('Action Error', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal Server Error'
    });
  }
};
