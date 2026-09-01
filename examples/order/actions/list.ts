import { OrderRepository } from '../services/order.repository.js';

export const getAllOrder = async () => {
  const orders = await OrderRepository.getAllOrders();
  let grandTotal = 0;
  let totalQuantity = 0;

  for (const order of orders) {
    grandTotal += order.total;
    for (const item of order.items) {
      totalQuantity += item.quantity;
    }
  }

  return { orderList: orders, grandTotal, totalQuantity };
};
