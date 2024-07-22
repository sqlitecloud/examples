# useDocsSearch

## Getting Started

To use the search component, [you need to initialize](#edge-function) it by passing the URL of the edge function created from the dashboard.

```js
import { useDocsSearch } from ./index";

function Search() {
  const searchUrl = "https://myhost.sqlite.cloud:8090/v2/functions/search-js";

  // Initialize the useSqlcSearch custom hook
  const {
    searchText,     // Text to search for
    searchRes,      // Search results
    searchResPrev,  // Search results for the previous searchText
    searchError,    // Error information if search fails
    validSearchUrl, // Boolean indicating if the search URL is valid
    isLoading,      // Boolean indicating if component is loading search result
    handleSearch,   // Function to handle search input changes
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

```ts
import type { SearchResult, SearchError, SqlcSearchReturn } from "./index";
```


## Edge Function

The code for the [edge function](https://docs.sqlitecloud.io/docs/introduction/edge_functions) to be created is as follows:

```js
const query = request.params.query;
const requestid = request.params.requestid;
return {
  data: {
    search: await connection.sql`SELECT url, options, replace(snippet(documentation, -1, '<b>', '</b>', '...', 10), x'0A', ' ') as 'snippet' FROM documentation WHERE content MATCH concat(${query}, '*') ORDER BY rank LIMIT 256;`,
    requestid: requestid
  }
}
```
- Replace `documentation` with the name of your database.
- Select `JavaScript` as the function type.
- Choose an appropriate API KEY with the correct permission to read from your database. The API KEY can be created from the dashboard's Security/API KEY section.


## Demo
We provide a simple example that shows how to use the component in the `tester.js` [file](https://github.com/sqlitecloud/examples/blob/main/js/components/useDocsSearch/src/tester.js).

To run the example, download the repo and follow these steps:
1. Navigate to the `/js/components/useDocsSearch` directory.
2. Run `npm run install`.
2. Run `npm run start`.

The example code will be executed at `localhost:1234`

