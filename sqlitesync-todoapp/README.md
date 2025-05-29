# SQLiteSync Demo: Multiuser To-Do App

This repository demonstrates how to use **SQLiteSync**, our CRDT-based synchronization solution, to keep data synchronized between multiple **edge devices** and the **SQLiteCloud** service. It features:

- Cloud-side configuration of synchronization and Row-Level Security (RLS)
- Edge device simulation using the `sqlite3` CLI
- A multitenant **To-Do application** data model

## Overview

**SQLiteSync** extends SQLite to enable automatic data synchronization between local databases on edge devices and a centralized **SQLiteCloud** instance. This example shows:

- How to configure **SQLiteCloud** for **SQLiteSync** (CRDT-based synchronization) and RLS
- How to simulate edge clients using the SQLite CLI
- How RLS restricts data access based on user permissions
- How to create and interact with the schema for a collaborative to-do app

## Requirements

- [SQLiteCloud account](https://sqlitecloud.io)
- SQLite 3.45+ CLI with extension loading support
-  [SQLiteSync](https://github.com/sqliteai/sqlite-sync) extension
- Access to this repository's `.sql` files

## Schema

The schema for this demo models a multitenant to-do list application with user access control.

```sql
-- USERS
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE DEFAULT "",
    email TEXT NOT NULL UNIQUE DEFAULT "" 
) WITHOUT ROWID;

-- TODO LISTS
CREATE TABLE todo_lists (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL DEFAULT "",
    description TEXT DEFAULT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) WITHOUT ROWID;
        
-- PERMISSIONS
CREATE TABLE permissions (
    user_id TEXT NOT NULL,
    list_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, list_id),
    FOREIGN KEY (list_id) REFERENCES todo_lists(id)
) WITHOUT ROWID;
    
-- TODOS
CREATE TABLE todos (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT,
    title TEXT,
    is_done INTEGER NOT NULL DEFAULT 0 CHECK (is_done IN (0, 1)),
    due_date DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES todo_lists(id)
) WITHOUT ROWID;
```

## Setup Instructions

### 1. Configure SQLiteCloud

#### On the Dashboard

1. Log in to your [SQLiteCloud Dashboard](https://dashboard.sqlitecloud.io).
2. Upload the database from `./db/todoapp.sqlite` 
3. Enable **SQLiteSync** (OffSync button) for each table in the database from the project's Databases page.
4. Enable **Row-Level Security (RLS)** and configure policies for the `permissions`, `todo_lists`, `todos`, and `users` tables. You can copy each statement from the `./sql/cloud_rls_<tablename>.sql` files. These rules ensure that users can only view and interact with:
   - Lists they created
   - Lists shared with them via the `permissions` table (as owner, editor, or viewer)
   - Todos belonging to those lists
5. Insert the first users of the app. From the Studio page, execute the following lines from `./sql/cloud_insert_users.sql`:

```sql
INSERT INTO users (id, username, email) VALUES
  ('018ecfc2-b2b0-7cc2-a9f0-987cef6b49f1', 'alice', 'alice@example.com'),
  ('018ecfc2-b2b1-7cc3-a9f0-987cef6b49f2', 'bob', 'bob@example.com'),
  ('018ecfc2-b2b2-7cc4-a9f0-987cef6b49f3', 'carol', 'carol@example.com'),
  ('018ecfc2-b2b3-7cc5-a9f0-987cef6b49f4', 'dan', 'dan@example.com');
```

6. Create a token for each user (`alice`, `bob`, `carol`, and `dan`) using a REST API call. For example, you can try the REST API with `curl` from a terminal and extract the `token` from the response.

   ```
   curl -X "POST" "https://<project_address>/v2/tokens" \
        -H 'Authorization: Bearer <apikey>' \
        -H 'Content-Type: application/json; charset=utf-8' \
        -d $'{
     "name": "alice",
     "userId": "018ecfc2-b2b0-7cc2-a9f0-987cef6b49f1"
   }'
   ```

### 2. Edge Devices Simulation

Each edge device simulates a different user using the `sqlite3` CLI. Alternatively, you can execute the same SQL queries programmatically using your preferred programming language and SQLite driver.

#### Example Edge Device Setup

```bash
sqlite3 todoapp_edge_device_1.sqlite
```

Then, inside the CLI:

```sql
-- Load the extension
.load /path/to/extension/cloudsync.dylib

-- Load the schema
.read sql/schema.sql

-- Init cloudsync for all the tables
SELECT cloudsync_init('*');

-- Load initial sync state if needed
.read sql/edge_device_1_init.sql

-- Connect to the cloud
SELECT cloudsync_network_init('sqlitecloud://<project_address>/todoapp.sqlite');
SELECT cloudsync_set_token('<alice_token>');

-- Start the synchronization process:
--   1. Retrieve changes by periodically invoking cloudsync_network_check_changes:
SELECT cloudsync_network_check_changes();
-- ...
SELECT cloudsync_network_check_changes();

--   2. Send local changes:
SELECT cloudsync_network_send_changes();

-- Run your application queries here
-- for example: 
--   SELECT * FROM users;
--   SELECT * FROM todos JOIN todo_lists ON todos.list_id = todo_lists.id

-- Before closing the db connection, close cloudsync
SELECT cloudsync_terminate()
```

Repeat similar steps for `edge_device_2.db` and `edge_device_3.db`, using their respective `.sql` files and tokens for users `bob` and `carol`.

## Using the Demo

After setup:

- Any `INSERT`, `UPDATE`, or `DELETE` operation on a local database will be propagated to the cloud and synchronized across all clients using `SELECT cloudsync_network_send_changes();`, subject to RLS rules.
- Retrieve remote changes by periodically calling `SELECT cloudsync_network_check_changes();`.
- The app can query the local database for immediate responses, avoiding network latency.
- Changes made on one edge device will eventually propagate to others, in accordance with the CRDT model.

## License

This demo is provided under the MIT License. See [LICENSE](LICENSE) for more details.

## Contact

For support or more information, visit [sqlitecloud.io](https://sqlitecloud.io) or contact us at support@sqlitecloud.io.
