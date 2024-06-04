const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 30 });
let isCacheEnabled = true;

const cacheMiddleware = (req, res, next) => {
  if (!isCacheEnabled) {
    return next();
  }

  const key = req.originalUrl;
  console.log(key);
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    res.send(cachedResponse);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      console.log(body);
      cache.set(key, body);
      res.sendResponse(body);
    };

    next();
  }
};

const toggleCache = () => {
  isCacheEnabled = !isCacheEnabled;
  return isCacheEnabled;
};

const getCache = () =>
  cache.keys().map((key) => ({ key, data: cache.get(key) }));
const getCacheState = () => isCacheEnabled;

module.exports = { cacheMiddleware, getCache, toggleCache, getCacheState };
