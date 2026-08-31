import * as grpc from '@grpc/grpc-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadProto, createGrpcClient } from '../../../src/index.js';
import { getConfig } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let productClientInstance: any;

export const getProductClient = () => {
  if (!productClientInstance) {
    const config = getConfig();
    const productProtoPath = path.resolve(__dirname, '../../product/proto/product.proto');
    const productPackage = loadProto(productProtoPath) as any;

    productClientInstance = createGrpcClient(
      productPackage.product.ProductService,
      config.GRPC_HOST || '127.0.0.1',
      config.PRODUCT_SERVICE_PORT
    );
  }
  return productClientInstance;
};

export const fetchProductById = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = getProductClient();
    client.getProduct({ id }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const decreaseProductQuantityCall = (id: string, quantity: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = getProductClient();
    client.decreaseProductQuantity({ id, quantity }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
      } else if (!response.success) {
        reject(new Error(response.message));
      } else {
        resolve(response);
      }
    });
  });
};
