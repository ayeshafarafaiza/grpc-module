import * as grpc from '@grpc/grpc-js';
import { OrderService } from '../services/order.service.js';
import { GrpcError } from '../../../src/index.js';
import { Logger } from '../../../src/index.js';

export const createNewOrder = async (
  call: grpc.ServerUnaryCall<{ items: { productId: string; quantity: number }[] }, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { items } = call.request;
    const result = await OrderService.createOrder(items);
    callback(null, result);
  } catch (err) {
    if (err instanceof GrpcError) {
      callback({ code: err.code, message: err.message });
    } else {
      Logger.error('Error creating order', err);
      callback({ code: grpc.status.INTERNAL, message: 'Internal Server Error' });
    }
  }
};
