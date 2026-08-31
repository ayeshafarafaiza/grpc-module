export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const listProducts: Product[] = [
  {
    id: '1112',
    name: 'macbook pro',
    price: 3000,
    quantity: 7
  },
  {
    id: '1113',
    name: 'Iphone X',
    price: 2000,
    quantity: 3
  },
  {
    id: '1114',
    name: 'Earphone',
    price: 500,
    quantity: 25
  }
];

export class ProductRepository {
  public static async getProductById(id: string): Promise<Product | undefined> {
    return listProducts.find((prod) => prod.id === id);
  }

  public static async getAllProducts(): Promise<Product[]> {
    return listProducts;
  }

  public static async createProduct(product: Product): Promise<Product> {
    listProducts.push(product);
    return product;
  }

  public static async searchProducts(keyword: string): Promise<Product[]> {
    return listProducts.filter(
      (prod) => prod.name.toLowerCase().includes(keyword.toLowerCase()) || prod.id === keyword
    );
  }

  public static async decreaseQuantity(id: string, quantity: number): Promise<boolean> {
    const product = listProducts.find((prod) => prod.id === id);
    if (product && product.quantity >= quantity) {
      product.quantity -= quantity;
      return true;
    }
    return false;
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    const index = listProducts.findIndex((prod) => prod.id === id);
    if (index !== -1) {
      listProducts.splice(index, 1);
      return true;
    }
    return false;
  }
}
