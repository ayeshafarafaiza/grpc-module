# gRPC Module

**`grpc-module`** is a lightweight Node.js wrapper for gRPC. It handles the boilerplate of creating servers and clients, loading `.proto` files, and managing errors so you can focus on building your microservices.

> **IMPORTANT: MODULE CODE vs CONSUMER CODE**
> This repository provides `grpc-module`, a reusable infrastructure package. It does **not** contain business logic. The `Product` and `Order` examples included in this repository are **Consumer Applications** provided purely as demonstrations. Do not add your business logic (e.g. Repositories, Databases, Controllers) into this module.

## 1. Overview & Core Concepts

### What is gRPC and Protocol Buffers?
- **gRPC**: A modern, high-performance Remote Procedure Call (RPC) framework that can run in any environment. It allows a client application to directly call a method on a server application on a different machine as if it were a local object.
- **Protocol Buffers (.proto)**: Google's language-neutral, platform-neutral mechanism for serializing structured data. It acts as the strict contract between services.
- **RPC (Remote Procedure Call)**: The actual function call (e.g., `GetProduct(Request) returns (Response)`).

### Polyglot (Cross-Language) Microservices
Because the `.proto` file is language-neutral, a **Golang** service can act as the Server while a **Node.js** service (using this `grpc-module`) acts as the Client. They communicate seamlessly over HTTP/2 using binary data, completely unaware of each other's programming languages.

### How this module helps
Implementing raw gRPC in Node.js requires significant boilerplate for loading protos, formatting errors, creating channels, and handling server lifecycles. This module wraps all that complexity into a strict, type-safe API that enforces Domain-Driven Design (DDD) by isolating the transport layer from your business logic.

---

## 2. Real-World Integration

In a microservice architecture, `grpc-module` sits at the very bottom (Infrastructure Layer) of your applications. Your services own their respective domains, while `grpc-module` simply facilitates the transport of data between them.

---

## 3. Integration / Download

This module is hosted exclusively on GitHub. To use it in your microservices, clone the repository directly into your project:

```bash
git clone https://github.com/ayeshafarafaiza/grpc-module.git
```

### Important: GitHub `.gitignore` Rules
When managing this module on GitHub, your `.gitignore` must be configured to prevent leaking secrets or compiled files. Ensure it contains at least:
```text
node_modules/
dist/
.env
```

---

## 4. Environment Configuration

Your consumer application (not this module) should manage an `.env` file. Do not hardcode configurations.

### Example `.env` (In your Consumer Project)
```env
# Application Environment
NODE_ENV=development

# Provider (Server) Configurations
GRPC_HOST=0.0.0.0
GRPC_PORT=50051

# Target Services (Client) Configurations
PRODUCT_SERVICE_HOST=127.0.0.1
PRODUCT_SERVICE_PORT=50051
```

| Variable | Purpose | Example | Required |
| --- | --- | --- | --- |
| `NODE_ENV` | Controls module security features (e.g. Reflection) | `development` / `production` | Yes |
| `GRPC_HOST` | The IP to bind the server to | `0.0.0.0` | Yes (Server) |
| `GRPC_PORT` | The Port to bind the server to | `50051` | Yes (Server) |

**Note**: Do not commit your `.env` file to GitHub. Use `.env.example` to provide templates.

---

## 5. Consumer Application Structure (DDD)

When integrating `grpc-module` into an existing service, respect the boundaries of Domain-Driven Design (DDD).

```text
your-backend-service/
├── src/
│   ├── domain/               # Core business entities
│   ├── application/          # Use cases (e.g., ProcessOrder)
│   ├── infrastructure/       # External tools
│   │   └── grpc/             
│   │       ├── client.ts     # Uses grpc-module to create clients
│   │       ├── server.ts     # Uses grpc-module to create servers
│   │       └── proto/        # Your specific .proto contracts
│   └── index.ts
├── .env
└── package.json
```

---

## 6. Public API Exports

This module strictly controls what it exposes to consumers to prevent internal logic leaks.
```typescript
import {
  GenericGrpcServer,
  createGrpcClient,
  loadProtos,
  loadProto,
  GrpcError,
  Logger
} from 'grpc-module';
```

---

## 7. Defining Contracts (Proto)

Protos are owned by the specific consumer services, not by `grpc-module`. 

### Example: `product.proto` (Stored in your Service's repo)
```protobuf
syntax = "proto3";
package product;

service ProductService {
  rpc GetProduct(ProductRequest) returns (ProductResponse);
}

message ProductRequest {
  string id = 1;
}

message ProductResponse {
  string id = 1;
  string name = 2;
  double price = 3;
}
```

---

## 8. gRPC Server Implementation

How your provider service initializes a server and registers business logic using `grpc-module`.

```typescript
import { GenericGrpcServer, loadProtos, GrpcError } from 'grpc-module';
import path from 'path';

async function bootstrapServer() {
  const host = process.env.GRPC_HOST || '0.0.0.0';
  const port = parseInt(process.env.GRPC_PORT || '50051', 10);

  // 1. Load your Proto Contract
  const { packageDefinition, protoPackage } = loadProtos([
    path.resolve(__dirname, './proto/product.proto')
  ]);

  // 2. Initialize Server
  const server = new GenericGrpcServer(host, port);
  server.enableReflection(packageDefinition);

  // 3. Register Implementation (Business Logic adapter)
  server.registerService((protoPackage.product as any).ProductService.service, {
    getProduct: async (call: any) => {
      const productId = call.request.id;
      if (!productId) throw GrpcError.invalidArgument('Missing ID');
      
      // Fetch from Database (Application Layer)
      return { id: productId, name: 'Laptop', price: 1500 }; 
    }
  });

  // 4. Start
  await server.start();
}
```

---

## 9. Multiple Service Registration

The `GenericGrpcServer` supports registering multiple domains on a single port.

```typescript
// Assuming protoPackage has both product and inventory definitions
server.registerService((protoPackage.product as any).ProductService.service, productImplementation);
server.registerService((protoPackage.inventory as any).InventoryService.service, inventoryImplementation);
```

---

## 10. gRPC Client Implementation

How your consumer service communicates with the provider.

```typescript
import { createGrpcClient, loadProtos, GrpcError } from 'grpc-module';
import path from 'path';

// 1. Load Proto
const { protoPackage } = loadProtos([
  path.resolve(__dirname, './proto/product.proto')
]);

// 2. Create Client Target
const host = process.env.PRODUCT_SERVICE_HOST || '127.0.0.1';
const port = parseInt(process.env.PRODUCT_SERVICE_PORT || '50051', 10);

const productClient = createGrpcClient<any>(
  (protoPackage.product as any).ProductService, 
  host, 
  port
);

// 3. Use Client
try {
  const response = await productClient.getProduct({ id: 'P001' });
  console.log('Received Product:', response);
} catch (err: any) {
  if (err.code === 14) console.error('Service UNAVAILABLE');
  else console.error('gRPC Error:', err.message);
}
```

### Polyglot Example: Golang Server ↔ Node.js Client
Because gRPC uses `.proto` files as a universal contract, you can easily mix programming languages. Here is a real-world example showing a **Golang Server** communicating perfectly with a **Node.js Client** (using this module).

**1. The Golang Provider (Server)**
The backend team writes the server in Go using the shared `.proto` file:
```go
func (s *server) GetProduct(ctx context.Context, req *pb.ProductRequest) (*pb.ProductResponse, error) {
    // Go Business Logic (e.g., GORM Database query)
    return &pb.ProductResponse{Id: req.Id, Name: "Laptop", Price: 1500}, nil
}
```

**2. The Node.js Consumer (Client)**
Your team uses `grpc-module` to seamlessly consume the Golang service without knowing it's written in Go!
```typescript
import { createGrpcClient, loadProtos } from 'grpc-module';
import path from 'path';

const { protoPackage } = loadProtos([path.resolve(__dirname, 'product.proto')]);

// Connect directly to the Golang Server via HTTP/2
const client = createGrpcClient<any>((protoPackage.product as any).ProductService, '192.168.1.50', 50051);

async function callGoServer() {
  try {
    const response = await client.getProduct({ id: 'P123' });
    console.log('Received from Golang:', response.name); // Outputs: "Laptop"
  } catch (err) {
    console.error(err);
  }
}
callGoServer();
```

---

## 11. Application Layer Integration

Do not place gRPC calls directly inside Domain logic. Use Ports & Adapters.

```typescript
// Application Service (Use Case)
export class OrderProcessor {
  constructor(private productAdapter: IProductAdapter) {}

  async process(productId: string) {
    // Application calls the abstraction, not the gRPC client directly
    const product = await this.productAdapter.fetchProduct(productId);
    // Continue processing...
  }
}
```

---

## 12. Service-to-Service Communication Flow (End-to-End)

```text
[Order Service (Consumer)]
1. OrderProcessor calls ProductAdapter.
2. ProductAdapter calls productClient.getProduct() via grpc-module.
3. grpc-module serializes data and sends over HTTP/2.
        ↓
[Product Service (Provider)]
4. grpc-module Server intercepts HTTP/2 request.
5. Invokes registered getProduct handler.
6. Handler fetches DB data.
7. grpc-module formats response and sends back over HTTP/2.
        ↓
[Order Service (Consumer)]
8. productClient receives data, returns to OrderProcessor.
```

---

## 13. Error Handling

`grpc-module` provides standard gRPC status mappings. Consumer applications should map these back to domain errors.

```typescript
// Inside your async action handler
if (!product) {
  // Just throw the GrpcError directly. The module's interceptor will catch it
  // and safely send it over the wire with status code 5 (NOT_FOUND).
  throw GrpcError.notFound('Product does not exist');
}
```

---

## 14. Connection Lifecycle & Graceful Shutdown

Handling startup and shutdown cleanly ensures zero downtime.

```typescript
import { GenericGrpcServer } from 'grpc-module';

let server: GenericGrpcServer;

async function bootstrap() {
  server = new GenericGrpcServer('0.0.0.0', 50051);
  // register services...
  await server.start();
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  if (server) {
    await server.shutdown(); // Safely closes active connections
  }
  process.exit(0);
});

bootstrap();
```

---

## 15. Connection Monitoring & Health Checks

gRPC connections are persistent (HTTP/2). You do not need to poll just to keep them alive. However, if you need to monitor if a downstream service is active (Liveness Check), implement a `Ping` or HealthCheck RPC.

```typescript
// Executed by the Consumer Service
setInterval(async () => {
  try {
    await productClient.Ping({});
    console.log('Product Service is HEALTHY');
  } catch (err: any) {
    console.warn('Product Service is DOWN (UNAVAILABLE)');
  }
}, 10000); // Check every 10 seconds
```

---

## 16. Development vs Production

The module acts conditionally based on the environment.

### Development (`NODE_ENV=development`)
- **Reflection**: Enabled (Allows tools like Postman to read your schemas automatically).
- **Diagnostics**: `cli.ts` debugging scripts are allowed.

### Production (`NODE_ENV=production`)
- **Reflection**: Strictly Blocked (Prevents attackers from scanning your internal API structures).
- **Diagnostics**: Development scripts will throw a `[SECURITY RESTRICTION]` error and crash immediately.

---

## 17. Example Playground

This repository comes with fully functional test applications (`Product` and `Order`) that demonstrate the module in action.

### Terminal Demonstration
**Terminal 1 (Start the Product Service):**
```bash
npm run example:product
```
**Terminal 2 (Start the Order Service which calls Product):**
```bash
npm run example:order
```
**Terminal 3 (Test CLI Restrictions):**
```powershell
# In PowerShell
$env:NODE_ENV="production"
npx tsx examples/scripts/cli.ts
# This will intentionally crash to prove production security!
```

### Postman Testing Guide
Because `NODE_ENV=development` enables Server Reflection, you can use Postman to discover and test all RPC methods without manually importing the `.proto` files.

1. Open Postman and create a new **gRPC Request**.
2. Enter the Server URL (e.g., `127.0.0.1:50051` for Product, `127.0.0.1:50052` for Order).
3. Postman will automatically load the available methods via Server Reflection.

#### Product Service Payloads (`127.0.0.1:50051`)

**`createProduct`**
```json
{
  "name": "Laptop",
  "price": 1500,
  "quantity": 10
}
```

**`getAllProduct`**
```json
{}
```

**`getProduct`**
```json
{
  "id": "1112"
}
```

**`searchProducts`**
```json
{
  "keyword": "macbook"
}
```

**`decreaseProductQuantity`**
```json
{
  "id": "1112",
  "quantity": 1
}
```

**`deleteProduct`**
```json
{
  "id": "1112"
}
```

#### Order Service Payloads (`127.0.0.1:50052`)

**`createNewOrder`**
```json
{
  "items": [
    {
      "productId": "1112",
      "quantity": 2
    }
  ]
}
```

**`getAllOrder`**
```json
{}
```

**`getOrder`**
```json
{
  "id": "ORD-123"
}
```

**`searchOrder`**
```json
{
  "keyword": "laptop"
}
```

**`deleteOrder`**
```json
{
  "id": "ORD-123"
}
```

---

## 18. Troubleshooting

| Symptom | Cause | How to Fix |
| --- | --- | --- |
| `Error: EADDRINUSE` | Another process is using your Port. | Kill the existing process bound to `50051`. |
| `Code: 14 (UNAVAILABLE)` | Client cannot reach the Server. | Check if the Server is running, or if host/port in `.env` is correct. |
| `Postman Reflection Fails` | Reflection is blocked. | Ensure `NODE_ENV=development` is exported in the terminal running the server. |
| `TypeError: client.myRpc is not a function` | Proto parsing mismatch. | Ensure the client uses the correct `(protoPackage.domain as any).Service` path. |

---

## 19. Versioning and Updates

This module is consumed directly from GitHub.
To release updates:
1. Ensure the codebase is clean and built: `npm run build`
2. Commit all changes including the `dist` folder.
3. Push to the main branch: `git push origin main`

Consumers will receive the updates by pulling the latest changes from the Git repository (`git pull`).

---

## 20. API / Public Exports

The strict public API contract exposed by `src/index.ts`:
- `GenericGrpcServer`
- `createGrpcClient`
- `loadProto`
- `loadProtos`
- `LoadedProto` (Type)
- `GrpcError`
- `Logger`

---


---

## 21. Pub/Sub to gRPC Compatibility

Modul ini menyediakan *Compatibility Layer* agar aplikasi Anda yang sebelumnya menggunakan Pub/Sub (seperti Kafka, RabbitMQ, dll) dapat menggunakan gRPC tanpa perlu merombak ulang *business logic*. Anda dapat menjalankan aplikasi dengan Pub/Sub maupun gRPC secara berdampingan atau saat proses migrasi berlangsung.

Gunakan interface `IMessagePublisher` di level aplikasi, dan tentukan adapternya (gRPC atau Pub/Sub) di level inisialisasi infrastruktur (*bootstrap*).

### Contoh Implementasi

**1. Application Layer (Business Logic)**
Kode ini 100% tidak peduli apakah ia sedang menggunakan Pub/Sub atau gRPC.

```typescript
import { IMessagePublisher } from 'grpc-module';

export class OrderService {
  constructor(private transport: IMessagePublisher) {}

  async processOrder(orderData: any) {
    // Proses order logic...
    
    // Publish payload secara transparan
    await this.transport.publish('order.created', orderData);
  }
}
```

**2. Infrastructure Layer (Bootstrap)**
Pilih _transport_ berdasarkan konfigurasi *environment* saat aplikasi dinyalakan.

```typescript
import { GrpcTransportAdapter, createGrpcClient, IMessagePublisher } from 'grpc-module';

async function bootstrap() {
  let transport: IMessagePublisher;

  if (process.env.TRANSPORT === 'grpc') {
    // Setup gRPC Adapter
    const orderClient = createGrpcClient(OrderServiceDef, '127.0.0.1', 50051);
    
    // Map "topic" ke fungsi client gRPC
    transport = new GrpcTransportAdapter({
      routes: {
        'order.created': { client: orderClient, methodName: 'emitOrderCreated' }
      }
    });
  } else {
    // Setup Pub/Sub Adapter (contoh: Kafka/RabbitMQ)
    transport = new ExistingPubSubAdapter(); 
  }

  // Inject ke Business Logic
  const service = new OrderService(transport);
  await service.processOrder({ id: 'ORD-123', item: 'Laptop' });
}
```
