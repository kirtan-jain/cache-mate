const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 30 });
let cacheEnabled = true;
let cacheAlways = false;
let loadCache = false;

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;

  if (loadCache && cache.get(key)) {
    console.log(`Load from cache due to backend down: ${key}`);
    return res.send(cache.get(key));
  }

  if (cacheEnabled) {
    if (cacheAlways) {
      const cachedResponse = cache.get(key);
      if (cachedResponse) {
        console.log(`Cache hit for ${key}`);
        return res.send(cachedResponse);
      } else {
        console.log(`Cache miss for ${key}`);
        res.sendResponse = res.send;
        res.send = (body) => {
          cache.set(key, body);
          res.sendResponse(body);
        };
        return next();
      }
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.set(key, body);
        res.sendResponse(body);
      };
      return next();
    }
  } else {
    return next();
  }
};

const toggleCache = (type) => {
  if (type === "cacheEnabled") {
    cacheEnabled = !cacheEnabled;
  } else if (type === "cacheAlways") {
    if (cacheEnabled) {
      cacheAlways = !cacheAlways;
    } else {
      alert("Please switch on Cache Enabled first.");
    }
  } else if (type === "loadCache") {
    loadCache = !loadCache;
  }
  return { cacheEnabled, cacheAlways, loadCache };
};

const deleteCache = () => {
  cache.flushAll();
  return cache.keys().length == 0;
};

const getCache = () =>
  cache.keys().map((key) => ({ key, data: cache.get(key) }));

const getCacheState = () => ({ cacheEnabled, cacheAlways, loadCache });

module.exports = {
  cacheMiddleware,
  getCache,
  toggleCache,
  deleteCache,
  getCacheState,
};
