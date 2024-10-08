# Example App using SQLite's Geopoly Extension

<img width="721" alt="Screenshot 2024-08-06 at 3 33 47 PM" src="https://github.com/user-attachments/assets/113ebbdc-778e-4862-a4cb-080c20cb57fd">

## Description

This example demo'es using SQLite's built-in Geopoly extension with SQLite Cloud to create a local attractions finder map-plication.

To build the app from scratch, read this [Tutorial](https://docs.sqlitecloud.io/docs/tutorial-geopoly) in the SQLite Cloud documentation. To quickly try it out, read on!

## Tutorial TL;DR - Get up-and-exploring NYC attractions fast!

1. In your SQLite Cloud account dashboard's left nav, click Databases > Create Database. To minimize code changes, name your new database `geopoly-demo`.

2. Clone and open the `examples` repo in your local editor. Install the `geopoly-demo` app's dependencies.

```
git clone https://github.com/sqlitecloud/examples.git
cd geopoly-demo
npm i
```

3. [Sign up](https://account.mapbox.com/auth/signup/) for an Individual Mapbox account. (We'll stay on the free tier.)

4. In the `geopoly-demo` directory, create a `.env` file. Add 2 env vars:

- `REACT_APP_CONNECTION_STRING`. Copy/ paste your connection string from your SQLite Cloud account dashboard.
- `REACT_APP_MAPBOX_TOKEN`. In your Mapbox account dashboard's nav, click Tokens. Copy/ paste your default public token.

5. Also in the `geopoly-demo` dir, create a `data/geodata.json` file. Complete just step `2. Curate your GeoJSON data` in the app [Tutorial](https://docs.sqlitecloud.io/docs/tutorial-geopoly).

6. Run `npm run create-tables` to create 2 DB tables in the `geopoly-demo` database:

- a `polygons` table to store the polygons generated by Geopoly as you interact with the app map, and
- an `attractions` table to store NYC attraction geodata. Since `data/geodata.json` will contain ~2000 Point features, it will take a little time for this command to finish inserting the attractions as rows.

7. Run `npm start` to start your local dev server. Visit `http://localhost:3000/` (adjust the port as-needed) in your browser to view the app.

- The loaded map is centered at Central Park, NYC.
- In the geocoder (i.e. search input) at the top right of the map, enter "Empire" and select the "Empire State Building" search result.
- A polygon will be generated by Geopoly, added to your `polygons` table, and displayed on the map.
- All attractions from your `attractions` table within the polygon area will be listed (nearest to furthest from the Empire State Building) in the left sidebar AND rendered as map markers.
- The map will zoom in to the closest attraction to your searched location, in this case the "Empire State Building". However, you can click on any attraction listing or marker to center that attraction on the map.
