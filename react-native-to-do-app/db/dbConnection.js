import { DB_CONNECTION_STRING } from "@env";
import { Database } from "@sqlitecloud/drivers";

export default db = new Database({
    connectionstring: DB_CONNECTION_STRING,
    usewebsocket: true,
  });

