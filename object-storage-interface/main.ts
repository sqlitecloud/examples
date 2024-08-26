import { Database, SQLiteCloudRowset } from "@sqlitecloud/drivers";
import { initializeObjectsTable } from "./initializeObjectsTable";
import { config } from "dotenv";
import {
  PutObjectRequest,
  GetObjectRequest,
  ListObjectsRequest,
  ListObjectsByDateRequest,
  DeleteObjectRequest,
  CommandResponse,
  Command,
} from "./types";
import { fieldCheck } from "./utils";
import fs from "fs";

config();

/** Command Classes */

class GetObjectCommand implements GetObjectRequest, Command {
  bucket: string;
  key: string;

  constructor(params: GetObjectRequest) {
    const validation = fieldCheck(params);
    if (validation.error) {
      throw new Error(validation.message);
    }
    this.bucket = params.bucket;
    this.key = params.key;
  }

  async execute(db: Database): Promise<CommandResponse> {
    try {
      const response =
        await db.sql` SELECT * FROM objects WHERE bucket=${this.bucket} AND key=${this.key}`;
      return {
        error: null,
        result: response,
        message: "Successfully retrieved object",
      };
    } catch (error) {
      return { error, result: null, message: "Error getting object" };
    }
  }
}

class PutObjectCommand implements PutObjectRequest, Command {
  bucket: string;
  key: string;
  body: string;

  constructor(params: PutObjectRequest) {
    const validation = fieldCheck(params);
    if (validation.error) {
      throw new Error(validation.message);
    }
    this.bucket = params.bucket;
    this.key = params.key;
    this.body = params.body;
  }

  async execute(db: Database): Promise<CommandResponse> {
    try {
      const created_at = new Date();
      const fileContent = fs.readFileSync(this.body);
      const result = await db.sql(
        ` INSERT INTO objects (bucket, key, file, created_at, modified_at) VALUES (?, ?, ?, ?, ?) RETURNING bucket, key, created_at`,
        [
          this.bucket,
          this.key,
          fileContent,
          created_at.toISOString(),
          created_at.toISOString(),
        ]
      );
      return { error: null, result, message: "Successfully added object" };
    } catch (error) {
      return { error, result: null, message: "Error adding object" };
    }
  }
}

class DeleteObjectCommand implements DeleteObjectRequest, Command {
  bucket: string;
  key: string;

  constructor(params: DeleteObjectRequest) {
    const validation = fieldCheck(params);
    if (validation.error) {
      throw new Error(validation.message);
    }
    this.bucket = params.bucket;
    this.key = params.key;
  }

  async execute(db: Database): Promise<CommandResponse> {
    try {
      const response = await db.sql(
        ` DELETE FROM objects WHERE bucket=? AND key=?`,
        [this.bucket, this.key]
      );
      return {
        error: null,
        result: null,
        message: `Succesfully deleted ${response.changes} entry with key ${this.key}`,
      };
    } catch (error) {
      return { error, result: null, message: "Error deleting object" };
    }
  }
}

class ListBucketsCommand implements Command {
  async execute(db: Database): Promise<CommandResponse> {
    try {
      const response = await db.sql` SELECT DISTINCT bucket FROM objects`;
      return {
        error: null,
        result: response,
        message: "Successfully listed buckets",
      };
    } catch (error) {
      return { error, result: null, message: "Error listing objects" };
    }
  }
}

class ListObjectsCommand implements ListObjectsRequest, Command {
  bucket: string;

  constructor(params: ListObjectsRequest) {
    this.bucket = params.bucket;
  }
  async execute(db: Database): Promise<CommandResponse> {
    try {
      const response = await db.sql(
        `SELECT key, created_at, modified_at FROM objects WHERE bucket=?`,
        this.bucket
      );
      return {
        error: null,
        result: response,
        message: "Successfully listed objects",
      };
    } catch (error) {
      return { error, result: null, message: "Error listing objects" };
    }
  }
}

class ListObjectsByDateCommand implements ListObjectsByDateRequest, Command {
  bucket: string;
  from: string;
  to?: string;

  constructor(params: ListObjectsByDateRequest) {
    this.bucket = params.bucket;
    this.from = params.from;
    this.to = params.to;
  }

  async execute(db: Database): Promise<CommandResponse> {
    try {
      if (!this.to) {
        let toDate = new Date(this.from);
        toDate.setUTCHours(0, 0, 0, 0);
        const startOfDayString = toDate.toISOString();
        let fromDate = toDate;
        fromDate.setUTCDate(fromDate.getUTCDate() + 1);
        fromDate.setUTCHours(0, 0, 0, 0);
        const startOfNextDayString = fromDate.toISOString();
        const response =
          await db.sql`SELECT key, created_at, modified_at FROM objects WHERE bucket = ${this.bucket} AND created_at BETWEEN ${startOfDayString} AND ${startOfNextDayString}`;
        return {
          error: null,
          result: response,
          message: "Successfully listed objects by date",
        };
      } else {
        let toDate;
        if (this.to.length === 10) {
          toDate = new Date(this.to);
          toDate.setUTCDate(toDate.getUTCDate() + 1);
          toDate.setUTCHours(0, 0, 0, 0);
          toDate = toDate.toISOString();
        }
        const response =
          await db.sql`SELECT key, created_at, modified_at FROM objects WHERE bucket = ${
            this.bucket
          } AND created_at BETWEEN ${this.from} AND ${
            !toDate ? this.to : toDate
          }`;
        return {
          error: null,
          result: response,
          message: "Successfully listed objects by date",
        };
      }
    } catch (error) {
      return { error, result: null, message: "Error listing objects by date" };
    }
  }
}

class ObjectClient {
  db: Database;

  constructor(connStr: string) {
    this.db = new Database(connStr);
    this.init();
  }

  init() {
    const { error, message } = initializeObjectsTable(this.db);
    if (error) {
      throw new Error(message);
    }
  }

  async send(command: any) {
    return command.execute(this.db);
  }
}

const main = async () => {
  const objectStorage = new ObjectClient(process.env.DB_CONNECTION_STRING!);

  const putObject = new PutObjectCommand({
    bucket: "documents",
    key: "FaceTime_User_Guide.pdf",
    body: "./assets/FaceTime_User_Guide.pdf",
  });
  const getObject = new GetObjectCommand({
    bucket: "documents",
    key: "FaceTime_User_Guide.pdf",
  });
  const listBuckets = new ListBucketsCommand();
  const listObjects = new ListObjectsCommand({ bucket: "documents" });
  const listObjectsByDate = new ListObjectsByDateCommand({
    bucket: "documents",
    from: "2024-07-29T10:29:00.000Z",
    to: "2024-07-29T19:00:00.000Z",
  });
  const deleteObject = new DeleteObjectCommand({
    bucket: "documents",
    key: "FaceTime_User_Guide.pdf",
  });

  const putResponse = await objectStorage.send(putObject);
  console.log(putResponse);
  const getResponse = await objectStorage.send(getObject);
  console.log(getResponse);
  const listBucketsResponse = await objectStorage.send(listBuckets);
  console.log(listBucketsResponse);
  const listObjectsResponse = await objectStorage.send(listObjects);
  console.log(listObjectsResponse);
  const listObjectsByDateResponse = await objectStorage.send(listObjectsByDate);
  console.log(listObjectsByDateResponse);
  const deleteResponse = await objectStorage.send(deleteObject);
  console.log(deleteResponse);
};

main();
