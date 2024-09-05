import { Database } from "@sqlitecloud/drivers";

// CREATE OBJECTS TABLE
export const initializeObjectsTable = (
  db: Database
): Promise<{ error: Error | null; message: string }> => {
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

  return new Promise((resolve, reject) => {
    db.run(createTableStatement, [], (tableError) => {
      if (tableError) {
        console.log("Error creating table", tableError);
        return reject({ error: tableError, message: "Error creating table" });
      } else {
        console.log("Successfully created table or table already exists");
        db.run(createIndexStatement, [], (indexError) => {
          if (indexError) {
            console.log("Error creating index", indexError);
            return reject({
              error: indexError,
              message: "Error creating index",
            });
          } else {
            console.log("Successfully created index or index already");
            return resolve({
              error: null,
              message: "Successfully created table and index",
            });
          }
        });
      }
    });
  });
};
