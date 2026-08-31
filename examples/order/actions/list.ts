import { Logger } from '../../../src/index.js';
import * as grpc from '@grpc/grpc-js';
import { OrderRepository } from '../services/order.repository.js';

export const getAllOrder = async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
  try {
    const orders = await OrderRepository.getAllOrders();
    let grandTotal = 0;
    let totalQuantity = 0;

    for (const order of orders) {
      grandTotal += order.total;
      for (const item of order.items) {
        totalQuantity += item.quantity;
      }
    }

    callback(null, { orderList: orders, grandTotal, totalQuantity });
  } catch (err) {
    Logger.error('Action Error', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal Server Error'
    });
  }
};
