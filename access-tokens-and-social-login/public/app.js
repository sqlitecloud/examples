window.addEventListener("DOMContentLoaded", () => {
  // The SQLite Cloud Token must be stored in a safer place
  // in a real application. This is just for demonstration purpose.
  const sqliteCloudToken = document.body.dataset.sqlitecloudToken;
  
  const sqliteCloudApiDetails = document.body.dataset.sqlitecloudApiDetails;
  const sqliteCloudApiQuery = document.body.dataset.sqlitecloudApiQuery;

  const detailsButton = document.getElementById("show-details");
  const queryButton = document.getElementById("run-query");
  const output = document.getElementById("output");

  detailsButton?.addEventListener("click", async () => {
    const res = await fetch(sqliteCloudApiDetails, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + sqliteCloudToken,
      },
    });
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  });

  queryButton?.addEventListener("click", async () => {
    const res = await fetch(sqliteCloudApiQuery, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + sqliteCloudToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "USE DATABASE chinook.sqlite;SELECT * FROM artists LIMIT 10;",
      }),
    });
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  });
});
