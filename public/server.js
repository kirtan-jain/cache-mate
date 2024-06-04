const express = require("express");
const next = require("next");
const {
  cacheMiddleware,
  getCache,
  toggleCache,
  getCacheState,
} = require("../src/middleware/cache.js");
const restRoutes = require("../src/pages/api/rest.js");
const graphqlRoutes = require("../src/pages/api/graphql.js");
const PORT_NUM = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use("/api", cacheMiddleware);
  server.use("/api", restRoutes);
  server.use("/api", graphqlRoutes);
  server.get("/cache", (req, res) => {
    res.json(getCache());
  });

  server.get("/toggle-cache", (req, res) => {
    const cacheState = toggleCache();
    res.json({ cacheEnabled: cacheState });
  });
  server.get("/cache-state", (req, res) => {
    const cacheState = getCacheState();
    res.json({ cacheEnabled: cacheState });
  });
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log(`running on ${PORT_NUM}`);
  });
});
