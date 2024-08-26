# Object Storage Interface

This project implements a TypeScript interface for object storage, similar to [AWS SDK for JavaScript v3 s3 actions](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html). It uses [SQLite Cloud](https://docs.sqlitecloud.io/) as the database for storing and retrieving objects.

### Features

- **Object Storage**: Store, retrieve, list, and delete objects in named buckets.

### Prerequisites

- Node.js
- TypeScript
- [SQLite Cloud account](https://sqlitecloud.io/register) and connection string

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory and add your SQLite Cloud connection string

Grab a connection string by clicking on a node in your dashboard. Make sure to add the database name to the connecting string you get. The host is already included in your connection string.

```bash
DB_CONNECTION_STRING="sqlitecloud://{HOST}.sqlite.cloud:8860/{DATABASE_NAME}?apikey=#######"
```

### Usage

The main class `ObjectClient` provides an interface similar to AWS S3.

The `ObjectClient` class has an init method and a send method. The init method creates a table to store objects and their metadata, including a bucket attribute for categorization. The send method takes in a command object and calls the command’s “execute” method.

The project uses a command pattern, encapsulating each operation (like getting, putting, listing, or deleting an object) in a class. Each command class implements an execute method that performs the action using the provided database instance.

#### Available Commands

- `PutObjectCommand`: Upload an object to a bucket
- `GetObjectCommand`: Retrieve an object from a bucket
- `DeleteObjectCommand`: Delete an object from a bucket
- `ListBucketsCommand`: List all buckets
- `ListObjectsCommand`: List objects in a bucket
- `ListObjectsByDateCommand`: List objects in a bucket within a date range

The `ListObjectsByDateCommand` class, allows users to query objects in a bucket by date range. This class accepts either a timestamp or a date in the format YYYY-MM-DD as an argument.

#### Response

All commands return a CommandResponse object with the following structure:

```typescript
{
  error: any | null,
  result: any | null,
  message: string
}
```

#### Example Usage

Below is an example of how to use the Object Storage Wrapper:

```typescript
import { ObjectClient, PutObjectCommand, GetObjectCommand } from "./main";

const main = async () => {
  const objectStorage = new ObjectClient(process.env.DB_CONNECTION_STRING!);

  // Put an object
  const putObject = new PutObjectCommand({
    bucket: "documents",
    key: "example.pdf",
    body: "./path/to/example.pdf",
  });
  const putResponse = await objectStorage.send(putObject);

  // Get an object
  const getObject = new GetObjectCommand({
    bucket: "documents",
    key: "example.pdf",
  });
  const getResponse = await objectStorage.send(getObject);
};

main();
```

### Directory Structure

- `initializeObjectsTable.ts`: Contains the logic to initialize the database table for storing objects.
- `main.ts`: Main entry point for the example usage.
- `types.d.ts`: Defines TypeScript types for various requests and responses.
- `utils.ts`: Utility functions, such as field validation.
