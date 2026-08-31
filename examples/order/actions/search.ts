import { Logger } from '../../../src/index.js';
import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';

export const searchOrder = async (
  call: grpc.ServerUnaryCall<{ keyword: string }, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { keyword } = call.request;
    if (!keyword) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Keyword is required'
      });
    }

    const orders = await OrderRepository.searchOrders(keyword);
    callback(null, { orderList: orders });
  } catch (err) {
    Logger.error('Action Error', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal Server Error'
    });
  }
};
