# Example Using SQLite Cloud Access Tokens with Google Login

## Description

This example demonstrates how to generate and use SQLite Cloud Access Tokens and integrate them into your authentication flow, such as Google Login.  
SQLite Cloud Access Tokens allow your users to access SQLite Cloud services, like SQLite Sync or querying your database.

To restrict user access via Access Tokens, enable [Row Level Security](https://docs.sqlitecloud.io/rls) policies on your database tables.

Read more about **SQLite Cloud Access Tokens** in the [official documentation](https://docs.sqlitecloud.io/docs/access-tokens).

## Requirements

This project is built with Express.js and TypeScript and requires Node.js.

## How to Run

1. If you don't have an account, create one at [SQLite Cloud](https://sqlitecloud.io) and obtain your **Connection String**. From the **Weblite** panel of your project, also copy the base URL of the gateway serving the REST API.

2. In the root of the project directory, rename the `.env.example` file to `.env`, then set your **Connection String** and the **gateway URL**.

3. Go to the Google Cloud Console and obtain your Google OAuth credentials from [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).  
Then copy the **Client ID** and **Client Secret** into the `.env` file.

4. Run:
```bash
npm install && npm run start
```

5. The server will start at [http://localhost:3003](http://localhost:3003).