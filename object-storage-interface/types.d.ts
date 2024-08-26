import { Database, SQLiteCloudRowset } from "@sqlitecloud/drivers";

export type CommandResponse = {
  error: any;
  result: SQLiteCloudRowset | null;
  message: string;
}

export interface Command {
  execute: (db: Database) => Promise<CommandResponse>;
}

export interface PutObjectRequest {
  bucket: string;
  key: string;
  body: string;
}

export interface GetObjectRequest {
  bucket: string;
  key: string;
}

export interface DeleteObjectRequest {
  bucket: string;
  key: string;
}

export interface ListObjectsRequest {
  bucket: string;
}

export interface ListObjectsByDateRequest {
  bucket: string;
  from: string;
  to?: string;
}