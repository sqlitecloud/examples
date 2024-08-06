import { Database } from '@sqlitecloud/drivers';
import 'dotenv/config';
import geodata from '../../data/geodata.json' assert { type: 'json' };

async function createDatabase() {
  const db = new Database(process.env.REACT_APP_CONNECTION_STRING);

  const db_name = 'geopoly-app';
  await db.sql`USE DATABASE ${db_name};`;

  await db.sql`CREATE VIRTUAL TABLE polygons USING geopoly()`;

  await db.sql`CREATE TABLE attractions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, lng REAL NOT NULL, lat REAL NOT NULL, coordinates TEXT NOT NULL)`;

  // stick to node (Point) data from Overpass API!
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

/*
Overpass API query:

[out:json][timeout:25];

// Define areas for Paris, New York, and Tokyo
area[name="New York"]->.newyork;

// Fetch nodes, ways, and relations tagged as tourist attractions in these areas
(
  node["amenity"="events_venue"](area.newyork);
  node["amenity"="exhibition_centre"](area.newyork);
  node["amenity"="music_venue"](area.newyork);
  node["amenity"="social_centre"](area.newyork);
  node["amenity"="marketplace"](area.newyork);
  node["building"="museum"](area.newyork);
  node["historic"="building"](area.newyork);
  node["tourism"="attraction"](area.newyork);
  node["leisure"="park"](area.newyork);
  node["natural"="beach"](area.newyork);
  node["shop"="coffee"](area.newyork);
  node["sport"="yoga"](area.newyork);
);

// Output the data
out body;
>;
out skel qt;

*/
