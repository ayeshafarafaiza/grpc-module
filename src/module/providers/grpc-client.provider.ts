import * as grpc from '@grpc/grpc-js';
import util from 'util';

export const createGrpcClient = <T extends Record<string, any>>(
  ClientClass: new (address: string, credentials: grpc.ChannelCredentials, options?: grpc.ClientOptions) => any,
  host: string,
  port: number,
  options?: grpc.ClientOptions
): T => {
  const address = `${host}:${port}`;
  const client = new ClientClass(address, grpc.credentials.createInsecure(), options);

  return new Proxy(client, {
    get(target, prop, receiver) {
      const originalMethod = target[prop as keyof typeof target];
      if (typeof originalMethod === 'function') {
        return (...args: any[]) => {
          // If the last argument is a function, treat it as a traditional callback
          if (args.length > 0 && typeof args[args.length - 1] === 'function') {
            return originalMethod.apply(target, args);
          }
          // Otherwise, return a Promise (ideal for unary calls)
          return util.promisify(originalMethod).apply(target, args);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as T;
};
