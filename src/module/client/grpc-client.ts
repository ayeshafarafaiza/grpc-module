import * as grpc from '@grpc/grpc-js';

export const createGrpcClient = <T extends grpc.Client>(
  ClientClass: new (address: string, credentials: grpc.ChannelCredentials, options?: grpc.ClientOptions) => T,
  host: string,
  port: number,
  options?: grpc.ClientOptions
): T => {
  const address = `${host}:${port}`;
  return new ClientClass(address, grpc.credentials.createInsecure(), options);
};
