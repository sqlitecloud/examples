/**
 * Example of NodeJS and ExpressJS app with Google Login
 * and SQLite Cloud Access Token generation for registered users.
 */

import { randomBytes, randomUUID } from "crypto";
import http, { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { extname, join } from "path";
import { existsSync, readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3003;
const PUBLIC_DIR = join(__dirname, "../public");

/**
 * Parse the connection string to get node address and API Key
 */
const SQLITECLOUD_CONNECTION_STRING = process.env.SQLITECLOUD_CONNECTION_STRING;
if (!SQLITECLOUD_CONNECTION_STRING) {
  throw new Error(
    "SQLITECLOUD_CONNECTION_STRING environment variable is not set. Create the .env file from .env.example"
  );
}
const sqlitecloudConnectionString = new URL(SQLITECLOUD_CONNECTION_STRING);

const SQLITE_CLOUD_API_KEY =
  sqlitecloudConnectionString.searchParams.get("apikey");
if (!SQLITE_CLOUD_API_KEY) {
  throw new Error(
    "SQLITECLOUD_API_KEY is not set. Create the .env file from .env.example"
  );
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;
if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are not set. Create the .env file from .env.example"
  );
}

const SQLITECLOUD_URL = `https://${sqlitecloudConnectionString.hostname}`;
const SQLITE_CLOUD_API_TOKENS = SQLITECLOUD_URL + "/v2/tokens";
const SQLITE_CLOUD_API_DETAILS = SQLITECLOUD_URL + "/v2/tokens/details";
const SQLITE_CLOUD_API_QUERY = SQLITECLOUD_URL + "/v2/weblite/sql";

const STATE = randomBytes(16).toString("hex");

function getMimeType(ext: string): string {
  return (
    {
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".html": "text/html",
    }[ext] || "application/octet-stream"
  );
}

function send(
  res: ServerResponse,
  status: number,
  body: string,
  type = "text/html"
) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function renderLoginPage() {
  return `<html><body>
    <a href="https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20email%20profile&state=${STATE}">Login with Google</a>
  </body></html>`;
}

async function getGoogleTokens(code: string) {  
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", CLIENT_ID || "");
  params.append("client_secret", CLIENT_SECRET || "");
  params.append("redirect_uri", REDIRECT_URI);
  params.append("grant_type", "authorization_code");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return res.json();
}

async function getSQLiteCloudToken(apikey: string) {
  const payload = {
    name: "test-user-token",
    userId: randomUUID(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // expires in 24 hours
  };
  
  const res = await fetch(SQLITE_CLOUD_API_TOKENS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apikey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create SQLite Cloud token: ${res.statusText}`);
  }

  return res.json();
}

http
  .createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const { pathname, query } = parse(req.url || "", true);

    // static files
    if (pathname && pathname.startsWith("/public/")) {
      const staticPath = join(PUBLIC_DIR, pathname.replace("/public/", ""));
      if (existsSync(staticPath)) {
        const content = readFileSync(staticPath).toString();
        return send(res, 200, content, getMimeType(extname(staticPath)));
      }
    }

    if (pathname === "/") {
      send(res, 200, renderLoginPage());
    } else if (pathname === "/auth/callback") {
      const q = query;
      if (q.state !== STATE || !q.code) {
        return send(res, 400, "Invalid state or missing code");
      }

      try {
        // Exchange code for tokens
        // Store the Google Token in the database
        const googleToken = await getGoogleTokens(q.code as string);

        // Create a SQLite Cloud Access Token for the user
        // Store it securely, the token cannot be retrieved later
        const sqliteCloudTokenData = await getSQLiteCloudToken(
          SQLITE_CLOUD_API_KEY
        );

        // Let the user to use the SQLite Cloud Access token
        // to access to SQLite Cloud API (eg, SQLite Sync, Weblite, etc)
        const sqliteCloudToken = sqliteCloudTokenData.data.token;

        const successHtml = readFileSync(
          join(PUBLIC_DIR, "success.html"),
          "utf8"
        )
          .replace(/__GOOGLE_TOKEN__/g, googleToken.access_token)
          .replace(/__SQLITE_CLOUD_TOKEN__/g, sqliteCloudToken)
          .replace(/__SQLITE_CLOUD_API_DETAILS__/g, SQLITE_CLOUD_API_DETAILS)
          .replace(/__SQLITE_CLOUD_API_QUERY__/g, SQLITE_CLOUD_API_QUERY);

        send(res, 200, successHtml);
      } catch (e) {
        send(res, 500, `Error: ${(e as Error).message}`);
      }
    } else {
      send(res, 404, "Not found");
    }
  })
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
