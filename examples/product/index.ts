import { getProduct } from './actions/get.js';
import { getAllProduct } from './actions/list.js';
import { createProduct } from './actions/create.js';
import { searchProducts } from './actions/search.js';
import { deleteProduct } from './actions/delete.js';
import { decreaseProductQuantity } from './actions/decrease.js';

export const service_product = {
  getProduct,
  getAllProduct,
  createProduct,
  searchProducts,
  deleteProduct,
  decreaseProductQuantity
};
