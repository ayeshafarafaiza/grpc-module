/* eslint-disable @typescript-eslint/no-unused-vars */
import { GrpcTransportAdapter } from '../src/index.js';
import { GrpcError } from '../src/index.js';
import { IMessageTransport } from '../src/index.js';
import { jest } from '@jest/globals';
import * as grpc from '@grpc/grpc-js';

describe('Pub/Sub Compatibility Layer (GrpcTransportAdapter)', () => {
  let mockClient: any;
  let adapter: IMessageTransport;

  beforeEach(() => {
    // A fake gRPC client returned by our createGrpcClient proxy
    mockClient = {
      emitProductCreated: jest.fn(() => Promise.resolve({ success: true })),
      causeError: jest.fn(() => Promise.reject(GrpcError.invalidArgument('Simulated error')))
    };

    adapter = new GrpcTransportAdapter({
      routes: {
        'product.created': { client: mockClient, methodName: 'emitProductCreated' },
        'product.failed': { client: mockClient, methodName: 'causeError' }
      }
    });
  });

  test('should successfully route a publish payload to the correct gRPC method', async () => {
    const payload = { productId: 'P-123', name: 'Laptop' };
    await adapter.publish('product.created', payload);

    expect(mockClient.emitProductCreated).toHaveBeenCalledTimes(1);
    expect(mockClient.emitProductCreated).toHaveBeenCalledWith(payload);
  });

  test('should throw a local error if topic is not mapped in the routes', async () => {
    await expect(adapter.publish('unknown.topic', {})).rejects.toThrow(
      '[GrpcTransportAdapter] No gRPC route configured for topic: unknown.topic'
    );
  });

  test('should throw a local error if mapped method does not exist on client', async () => {
    const brokenAdapter = new GrpcTransportAdapter({
      routes: {
        'broken.topic': { client: mockClient, methodName: 'nonExistentMethod' }
      }
    });

    await expect(brokenAdapter.publish('broken.topic', {})).rejects.toThrow(
      "[GrpcTransportAdapter] Method 'nonExistentMethod' does not exist on client for topic: broken.topic"
    );
  });

  test('should transparently bubble up GrpcError from the client', async () => {
    await expect(adapter.publish('product.failed', {})).rejects.toMatchObject({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Simulated error'
    });
  });

  test('should throw an architectural error if subscribe() is called', async () => {
    await expect(adapter.subscribe('product.created', async () => {})).rejects.toThrow(
      '[GrpcTransportAdapter] subscribe() is not supported. Use GenericGrpcServer.registerService instead.'
    );
  });
});
