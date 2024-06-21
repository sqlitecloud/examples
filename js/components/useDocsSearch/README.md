# useDocsSearch

## Getting Started

To use the search component, you need to initialize it by passing the URL of the edge function created from the dashboard. [More details below](#edge-function).

```
import { useDocsSearch } from ./index";

function Search() {
  const searchUrl = "https://myhost.sqlite.cloud:8090/v2/functions/search-js";

  // Initialize the useSqlcSearch custom hook
  const {
    searchText,    // Text to search for
    searchRes,     // Search results
    searchError,   // Error information if search fails
    validSearchUrl,// Boolean indicating if the search URL is valid
    handleSearch,  // Function to handle search input changes
  } = useDocsSearch(searchUrl);

  return (
    <div>
      <input
        type="text"
        value={searchText}
        onChange={handleSearch}
        placeholder="Type here..."
      />
      <pre>{JSON.stringify(searchRes, null, 2)}</pre>
    </div>
  )
}
```


## Typescript
The following types can be imported and used:

```
import { useDocsSearch } from ./index";
```


## Edge Function

The code for the edge function to be created is as follows [(Edge Functions documentation)](https://docs.sqlitecloud.io/docs/introduction/edge_functions):
```
const query = request.params.query;
const requestid = request.params.requestid;
return {
  data: {
    search: await connection.sql`SELECT url, replace(snippet(documentation, -1, '<b>', '</b>', '...', 10), x'0A', ' ') as 'snippet' FROM documentation WHERE content MATCH concat(${query}, '*') ORDER BY rank LIMIT 256;`,
    requestid: requestid
  }
}
```
- Replace `documentation` with the name of your database.
- Select `JavaScript` as the function type.
- Choose an appropriate API KEY with the correct permission to read from your database. The API KEY can be created from the dashboard's Security/API KEY section.


## Demo
[LIVE DEMO](https://sqlc-react-search.vercel.app/)

We provide a simple example that shows how to use the component in the [example folder](https://github.com/sqlitecloud/sqlc-components/tree/main/packages/sqlc-react-search/example).

To run the example, download the repo and follow these steps:
1. Run `npm install` at the root directory level.
2. Run `npm run start` in the `./packages/sqlc-react-search/example` subdirectory.

The example code will be executed at `localhost:1234`

