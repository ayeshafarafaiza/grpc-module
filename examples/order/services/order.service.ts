import { OrderRepository } from './order.repository.js';
import { fetchProductById, decreaseProductQuantityCall } from '../clients/product.client.js';
import { GrpcError } from '../../../src/index.js';

export class OrderService {
  static async createOrder(items: { productId: string; quantity: number }[]) {
    if (!items || items.length === 0) {
      throw GrpcError.invalidArgument('Order must contain at least one item');
    }

    const orderItemsDetails = [];
    let total = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw GrpcError.invalidArgument(`Invalid product item: ${JSON.stringify(item)}`);
      }

      let product;
      try {
        product = await fetchProductById(item.productId);
      } catch (err) {
        throw GrpcError.notFound(`Product Not Found or Product Service is unreachable for ID: ${item.productId}`);
      }

      if (product.quantity < item.quantity) {
        throw GrpcError.aborted(
          `Insufficient stock for Product ID: ${item.productId}. Remaining stock: ${product.quantity}`
        );
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      try {
        await decreaseProductQuantityCall(item.productId, item.quantity);
      } catch (err) {
        throw GrpcError.aborted(`Failed to decrease quantity for product ID: ${item.productId}`);
      }

      orderItemsDetails.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: subtotal
      });
    }

    const orderId = `ORD${new Date().valueOf()}`;
    const newOrder = {
      id: orderId,
      items: orderItemsDetails,
      total: total,
      createdAt: new Date().toISOString()
    };

    await OrderRepository.createOrder(newOrder);

    return { status: 'order success', total: total, orderId: orderId };
  }
}
