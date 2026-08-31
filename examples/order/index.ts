import { getOrder } from './actions/get.js';
import { getAllOrder } from './actions/list.js';
import { createNewOrder } from './actions/create.js';
import { searchOrder } from './actions/search.js';
import { deleteOrder } from './actions/delete.js';

export const service_order = {
  getOrder,
  getAllOrder,
  createNewOrder,
  searchOrder,
  deleteOrder
};
