import { initConfig, getConfig } from '../config/env.js';
import { GenericGrpcServer, loadProtos } from '../../src/index.js';
import { service_product } from '../product/index.js';
import { Logger } from '../../src/index.js';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  initConfig();
  const config = getConfig();

  const server = new GenericGrpcServer(config.GRPC_HOST, config.PRODUCT_SERVICE_PORT);

  const productProtoPath = path.resolve(__dirname, '../product/proto/product.proto');
  const loadedProto = loadProtos([productProtoPath], [path.resolve(__dirname, '../../')]);

  if (!loadedProto.protoPackage.product || !(loadedProto.protoPackage.product as any).ProductService) {
    throw new Error('Product proto package not found');
  }
  server.registerService((loadedProto.protoPackage.product as any).ProductService.service, service_product as any);

  server.enableReflection(loadedProto.packageDefinition);

  const shutdown = async () => {
    Logger.info('Received termination signal...');
    await server.shutdown();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await server.start();
};

run().catch((err) => Logger.error('Failed to run Product server', err));
