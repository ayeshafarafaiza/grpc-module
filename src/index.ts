export { GenericGrpcServer } from './module/providers/grpc-server.provider.js';
export { createGrpcClient } from './module/providers/grpc-client.provider.js';
export { loadProto, loadProtos } from './module/providers/proto-loader.provider.js';
export type { LoadedProto } from './module/types/grpc.type.js';
export { GrpcError } from './module/providers/grpc-error.provider.js';
export { Logger } from './module/utils/logger.util.js';

// Transport Compatibility Layer
export { GrpcTransportAdapter } from './module/providers/grpc-transport.adapter.js';
export type { GrpcTransportConfig, GrpcRouteDefinition } from './module/providers/grpc-transport.adapter.js';
export type { IMessageTransport, IMessagePublisher, IMessageSubscriber } from './module/types/transport.type.js';
