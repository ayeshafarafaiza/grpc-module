import { createGrpcClient, loadProto } from '../../src/index.js';
import { assertDevelopment } from '../../src/module/utils/env.js';
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

console.log('\n======================================================');
console.log('[INFO] SENDING REQUEST TO PRODUCT SERVICE (127.0.0.1:50051)');
console.log('======================================================\n');

// Call a Method
client.getAllProduct({}, (err: any, response: any) => {
  if (err) {
    console.error('[ERROR] RPC Failure:', err.details || err.message);
  } else {
    console.log('[SUCCESS] Response from Server:');
    console.log(JSON.stringify(response, null, 2));
  }

  // Biarkan proses berhenti sendiri
  setTimeout(() => process.exit(0), 100);
});
