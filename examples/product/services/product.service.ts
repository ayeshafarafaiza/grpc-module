import { ProductRepository, Product } from './product.repository.js';
import { GrpcError } from '../../../src/index.js';

export class ProductService {
  static async createProduct(id: string | undefined, name: string, price: number, quantity: number): Promise<Product> {
    if (!name || !price || price <= 0 || !quantity || quantity <= 0) {
      throw GrpcError.invalidArgument('Invalid product data');
    }

    const productId = id || `P${new Date().valueOf()}`;
    const newProduct: Product = {
      id: productId,
      name,
      price,
      quantity
    };

    return await ProductRepository.createProduct(newProduct);
  }

  static async getProductById(id: string): Promise<Product> {
    if (!id) {
      throw GrpcError.invalidArgument('Product ID is required');
    }

    const product = await ProductRepository.getProductById(id);
    if (!product) {
      throw GrpcError.notFound('Product Not Found');
    }

    return product;
  }

  static async searchProducts(keyword: string): Promise<Product[]> {
    if (!keyword) {
      throw GrpcError.invalidArgument('Search keyword is required');
    }

    const products = await ProductRepository.searchProducts(keyword);
    return products;
  }

  static async decreaseQuantity(id: string, quantity: number): Promise<{ success: boolean; message: string }> {
    if (!id || !quantity || quantity <= 0) {
      throw GrpcError.invalidArgument('Invalid request parameters');
    }

    const product = await ProductRepository.getProductById(id);
    if (!product) {
      throw GrpcError.notFound('Product Not Found');
    }

    if (product.quantity < quantity) {
      throw GrpcError.aborted('Insufficient quantity');
    }

    const success = await ProductRepository.decreaseQuantity(id, quantity);
    if (!success) {
      throw GrpcError.internal('Failed to decrease product quantity');
    }

    return { success: true, message: 'Quantity decreased successfully' };
  }

  static async getAllProducts(): Promise<Product[]> {
    return await ProductRepository.getAllProducts();
  }

  static async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    if (!id) {
      throw GrpcError.invalidArgument('Product ID is required');
    }

    const success = await ProductRepository.deleteProduct(id);
    if (!success) {
      throw GrpcError.notFound('Product Not Found or already deleted');
    }

    return { success: true, message: 'Product deleted successfully' };
  }
}
