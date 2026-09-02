import { IMessageTransport } from '../types/transport.type.js';
import { GrpcError } from './grpc-error.provider.js';

export type GrpcRouteDefinition = {
  client: any;
  methodName: string;
};

export type GrpcTransportConfig = {
  routes: Record<string, GrpcRouteDefinition>;
};

// Adapter mapping Pub/Sub concepts to gRPC
export class GrpcTransportAdapter implements IMessageTransport {
  private routeMap: Map<string, GrpcRouteDefinition>;

  constructor(config: GrpcTransportConfig) {
    this.routeMap = new Map(Object.entries(config.routes));
  }

  public async publish<T>(topic: string, payload: T): Promise<void> {
    const route = this.routeMap.get(topic);
    if (!route) {
      throw new Error(`[GrpcTransportAdapter] No gRPC route configured for topic: ${topic}`);
    }

    if (typeof route.client[route.methodName] !== 'function') {
      throw new Error(
        `[GrpcTransportAdapter] Method '${route.methodName}' does not exist on client for topic: ${topic}`
      );
    }

    try {
      await route.client[route.methodName](payload);
    } catch (err: any) {
      if (err instanceof GrpcError || err.code !== undefined) {
        throw err;
      }

      throw GrpcError.internal(`[GrpcTransportAdapter] Transport failed for topic ${topic}: ${err.message}`);
    }
  }

  // Subscriptions must be defined via GenericGrpcServer in a gRPC architecture
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async subscribe<T>(_topic: string, _handler: (payload: T) => Promise<void>): Promise<void> {
    throw new Error(
      '[GrpcTransportAdapter] subscribe() is not supported. Use GenericGrpcServer.registerService instead.'
    );
  }
}
