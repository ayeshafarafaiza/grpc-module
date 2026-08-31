export interface OrderItemDetails {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDetails {
  id: string;
  items: OrderItemDetails[];
  total: number;
  createdAt: string;
}

const listOrders: OrderDetails[] = [];

export class OrderRepository {
  public static async createOrder(order: OrderDetails): Promise<OrderDetails> {
    listOrders.push(order);
    return order;
  }

  public static async getOrderById(id: string): Promise<OrderDetails | undefined> {
    return listOrders.find((order) => order.id === id);
  }

  public static async getAllOrders(): Promise<OrderDetails[]> {
    return listOrders;
  }

  public static async searchOrders(keyword: string): Promise<OrderDetails[]> {
    return listOrders.filter(
      (order) => order.id.includes(keyword) || order.items.some((item) => item.productId.includes(keyword))
    );
  }

  public static async deleteOrder(id: string): Promise<boolean> {
    const index = listOrders.findIndex((order) => order.id === id);
    if (index !== -1) {
      listOrders.splice(index, 1);
      return true;
    }
    return false;
  }
}
