import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export interface LoadedProto {
  packageDefinition: protoLoader.PackageDefinition;
  protoPackage: grpc.GrpcObject;
}
