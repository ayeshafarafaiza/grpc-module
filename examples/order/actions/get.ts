import { Logger } from '../../../src/index.js';
import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';

export const getOrder = async (call: grpc.ServerUnaryCall<{ id: string }, any>, callback: grpc.sendUnaryData<any>) => {
  try {
    const { id } = call.request;
    const order = await OrderRepository.getOrderById(id);

    if (!order) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Order Not Found'
      });
    }

    callback(null, order);
  } catch (err) {
    Logger.error('Action Error', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal Server Error'
    });
  }
};
