import { createGrpcClient, loadProto } from '../../src/index.js';
import { assertDevelopment } from '../../src/module/utils/env.util.js';
import path from 'path';
import { fileURLToPath } from 'url';

assertDevelopment('Terminal CLI Demonstrator');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the Proto
const productProtoPath = path.resolve(__dirname, '../product/proto/product.proto');
const productProto: any = loadProto(productProtoPath, [path.resolve(__dirname, '../../')]);

// Create the Client
const client = createGrpcClient<any>(productProto.product.ProductService, '127.0.0.1', 50051);

console.log('[INFO] SENDING REQUEST TO PRODUCT SERVICE (127.0.0.1:50051)');

// Call a Method
const run = async () => {
  try {
    const response = await client.getAllProduct({});
    console.log('[SUCCESS] Response from Server:');
    console.log(JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error('[ERROR] RPC Failure:', err.details || err.message);
  } finally {
    setTimeout(() => process.exit(0), 100);
  }
};

run();
