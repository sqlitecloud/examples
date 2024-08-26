import { Database } from "@sqlitecloud/drivers";

// CREATE OBJECTS TABLE
export const initializeObjectsTable = (db: Database) => {
  const createTableStatement = `
    CREATE TABLE IF NOT EXISTS objects (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
      bucket TEXT NOT NULL, 
      key TEXT NOT NULL, 
      file BLOB NOT NULL, 
      created_at TEXT NOT NULL, 
      modified_at TEXT NOT NULL, 
      UNIQUE (bucket, key)
  );`;
  const createIndexStatement = `
    CREATE INDEX IF NOT EXISTS idx_objects_bucket_key ON objects (bucket, key);
    CREATE INDEX IF NOT EXISTS idx_objects_key ON objects (key);
  `;
  try {
    db.run(createTableStatement);
    console.log("Successfully created table or table already exists");
    db.run(createIndexStatement);
    console.log("Successfully created index or index already");
    return { error: null, message: "Successfully created table and index" };
  } catch (error) {
    return { error, message: "Error creating table and index" };
  }
};
