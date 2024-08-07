import { Database } from '@sqlitecloud/drivers';
import 'dotenv/config';
import geodata from '../../data/geodata.json' assert { type: 'json' };

async function createDatabase() {
  const db = new Database(process.env.REACT_APP_CONNECTION_STRING);

  const db_name = 'geopoly-demo';
  await db.sql`USE DATABASE ${db_name};`;

  await db.sql`CREATE VIRTUAL TABLE polygons USING geopoly()`;

  await db.sql`CREATE TABLE attractions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, lng REAL NOT NULL, lat REAL NOT NULL, coordinates TEXT NOT NULL)`;

  for (const feature of geodata['features']) {
    const { name } = feature.properties;
    const { coordinates } = feature.geometry;
    const [lng, lat] = coordinates;

    await db.sql`INSERT INTO attractions(name, lng, lat, coordinates) VALUES(${name}, ${lng}, ${lat}, ${JSON.stringify(
      coordinates
    )})`;
  }

  db.close();

  console.log('Geodata inserted!');
}

createDatabase();
