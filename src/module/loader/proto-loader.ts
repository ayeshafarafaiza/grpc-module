import { Logger } from '../utils/logger.js';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export interface LoadedProto {
  packageDefinition: protoLoader.PackageDefinition;
  protoPackage: grpc.GrpcObject;
}

/**
 * Loads an array of proto files dynamically.
 * @param protoPaths Array of absolute paths to .proto files
 * @param includeDirs Optional array of include directories for proto resolution
 */
export const loadProtos = (protoPaths: string[], includeDirs: string[] = []): LoadedProto => {
  try {
    const packageDefinition = protoLoader.loadSync(protoPaths, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs
    });
    const protoPackage = grpc.loadPackageDefinition(packageDefinition);
    Logger.info(`Loaded protos from ${protoPaths.length} files`);
    return { packageDefinition, protoPackage };
  } catch (err) {
    Logger.error(`Failed to load protos:`, err);
    throw err;
  }
};

/**
 * Expose a specific load method for a single file.
 * @param protoPath Absolute path to .proto file
 * @param includeDirs Optional array of include directories for proto resolution
 */
export const loadProto = (protoPath: string, includeDirs: string[] = []): grpc.GrpcObject => {
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs
  });
  return grpc.loadPackageDefinition(packageDefinition);
};
