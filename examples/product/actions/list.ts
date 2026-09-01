import { ProductService } from '../services/product.service.js';

export const getAllProduct = async () => {
  console.log('\n[PRODUCT] Received getAllProduct request');
  console.log('[PRODUCT] Returning product list...');
  const products = await ProductService.getAllProducts();
  return { products };
};
