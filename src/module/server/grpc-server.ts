import * as grpc from '@grpc/grpc-js';
import { ReflectionService } from '@grpc/reflection';
import * as protoLoader from '@grpc/proto-loader';
import { Logger } from '../utils/logger.js';
import { GrpcError } from '../errors/grpc-error.js';

import { isDevelopment } from '../utils/env.js';

export class GenericGrpcServer {
  private server: grpc.Server;
  private host: string;
  private port: number;
  private services: any = {};

  constructor(host: string, port: number) {
    this.server = new grpc.Server();
    this.host = host;
    this.port = port;
  }

  public enableReflection(packageDefinition: protoLoader.PackageDefinition) {
    if (!isDevelopment()) {
      Logger.warn('gRPC Reflection is restricted to development environment');
      return;
    }

    const reflectionService = new ReflectionService(packageDefinition);
    reflectionService.addToServer(this.server);
    Logger.info('gRPC Reflection enabled');
  }

  public registerService(
    serviceDef: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
    implementation: grpc.UntypedServiceImplementation
  ): void {
    const wrappedImplementation: grpc.UntypedServiceImplementation = {};

    for (const [methodName, handler] of Object.entries(implementation)) {
      wrappedImplementation[methodName] = async (call: any, callback: any) => {
        Logger.info(`Received request for RPC: ${methodName}`);

        try {
          if (typeof callback === 'function') {
            // Unary call wrapper
            const wrappedCallback = (error: any, response: any) => {
              if (error) {
                Logger.error(`RPC ${methodName} failed`, error);
              } else {
                Logger.info(`RPC ${methodName} succeeded`);
              }
              callback(error, response);
            };

            await (handler as any)(call, wrappedCallback);
          } else {
            // Streaming call wrapper
            await (handler as any)(call);
          }
        } catch (err: any) {
          Logger.error(`Unhandled exception in RPC ${methodName}`, err);

          if (err instanceof GrpcError) {
            callback({
              code: err.code,
              message: err.message
            });
          } else {
            callback({
              code: grpc.status.INTERNAL,
              message: 'Internal server error'
            });
          }
        }
      };
    }

    this.server.addService(serviceDef, wrappedImplementation);
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const address = `${this.host}:${this.port}`;
      this.server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
          Logger.error(`Failed to start gRPC Server on ${address}`, error);
          return reject(error);
        }
        Logger.info(`gRPC Server listening on ${this.host}:${port}`);
        resolve();
      });
    });
  }

  public async shutdown(): Promise<void> {
    return new Promise((resolve) => {
      Logger.info('Initiating graceful shutdown...');
      this.server.tryShutdown((err) => {
        if (err) {
          Logger.warn('Graceful shutdown failed, forcing close', err);
          this.server.forceShutdown();
        }
        Logger.info('gRPC server closed cleanly');
        resolve();
      });
    });
  }
}
