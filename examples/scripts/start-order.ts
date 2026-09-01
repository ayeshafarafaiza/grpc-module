import { initConfig, getConfig } from '../config/env.js';
import { GenericGrpcServer, loadProtos } from '../../src/index.js';
import { service_order } from '../order/index.js';
import path from 'path';
import { createGrpcClient } from '../../src/index.js';
import { Logger } from '../../src/index.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  initConfig();
  const config = getConfig();

  const server = new GenericGrpcServer(config.GRPC_HOST, config.ORDER_SERVICE_PORT);

  const orderProtoPath = path.resolve(__dirname, '../order/proto/order.proto');
  const productProtoPath = path.resolve(__dirname, '../product/proto/product.proto');
  const loadedProtos = loadProtos([orderProtoPath, productProtoPath], [path.resolve(__dirname, '../../')]);

  if (!loadedProtos.protoPackage.order || !(loadedProtos.protoPackage.order as any).OrderService) {
    throw new Error('Order proto package not found');
  }
  server.registerService((loadedProtos.protoPackage.order as any).OrderService.service, service_order as any);

  server.enableReflection(loadedProtos.packageDefinition);

  const intervals: NodeJS.Timeout[] = [];

  const shutdown = async () => {
    Logger.info('Received termination signal...');
    intervals.forEach(clearInterval);
    await server.shutdown();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await server.start();

  const productProto = (loadedProtos.protoPackage.product as any)?.ProductService ? loadedProtos : null;

  if (!productProto) {
    Logger.warn('Product proto package not found, inter-service test might fail');
  }

  const productClient = productProto
    ? createGrpcClient<any>(
        (productProto.protoPackage.product as any).ProductService,
        config.GRPC_HOST,
        config.PRODUCT_SERVICE_PORT
      )
    : null;

  intervals.push(
    setInterval(async () => {
      console.log('\n[ORDER] Calling service_product (getAllProduct)');
      if (productClient) {
        try {
          const res = await productClient.getAllProduct({});
          console.log('[ORDER] Received response from Product Service');
          console.log(`[ORDER] Processing response... Total products: ${res.products ? res.products.length : 0}`);
        } catch (err: any) {
          console.error('[ORDER] Error calling Product Service:', err.details || err.message);
        }
      }
    }, 10000)
  );

  const orderProto = (loadedProtos.protoPackage.order as any)?.OrderService ? loadedProtos : null;
  const orderClient = orderProto
    ? createGrpcClient<any>(
        (orderProto.protoPackage.order as any).OrderService,
        config.GRPC_HOST,
        config.ORDER_SERVICE_PORT
      )
    : null;

  intervals.push(
    setInterval(async () => {
      Logger.info('Internal Check: Sales Dashboard');
      if (orderClient) {
        try {
          const res = await orderClient.getAllOrder({});
          Logger.info(`Laporan Penjualan`);
          Logger.info(`Jumlah Pesanan Masuk : ${res.orderList ? res.orderList.length : 0}`);
          Logger.info(`Total Barang Terjual : ${res.totalQuantity || 0}`);
          Logger.info(`Total Omset (Pendp.): ${res.grandTotal || 0}`);
        } catch (err: any) {
          Logger.error('RPC Error (Order Dashboard):', err.details || err.message);
        }
      }
    }, 15000)
  );
};

run().catch((err) => Logger.error('Failed to run Order server', err));
