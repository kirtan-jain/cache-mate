const fs = require("fs");
const path = require("path");
const cacheFilePath = path.join(__dirname, "data.json");
let cacheData = {};
const loadCacheFromFile = () => {
  const rawData = fs.readFileSync(cacheFilePath, "utf8");
  cacheData = JSON.parse(rawData || "{}");
};

const saveCacheToFile = () => {
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
};

let cacheEnabled = true;
let cacheAlways = false;
let loadCache = false;

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cacheData[key];

  loadCacheFromFile();

  if (req.query.simulateError === "true") {
    return res.status(500).send("Simulated error");
  }
  if (loadCache) {
    try {
      next();
      res.on("finish", () => {
        if (res.statusCode > 399) {
          if (cacheData[key]) {
            console.log(`serving cached data for ${key} due to backend error`);
            res.send(cacheData[key]);
          }
        }
      });
    } catch (error) {
      if (cacheData[key]) {
        console.log(`serving cached data for ${key} due to backend error`);
        res.send(cacheData[key]);
      }
      console.log("backend down and data not in cache");
      return res.send("backend down and data not in cache");
    }
    return;
  }

  if (cacheEnabled) {
    if (cacheAlways) {
      if (cachedResponse) {
        console.log(`cache hit for ${key}`);
        return res.send(cachedResponse);
      } else {
        console.log(`cache miss for ${key}`);
        res.sendResponse = res.send;
        res.send = (body) => {
          cacheData[key] = body;
          saveCacheToFile();
          res.sendResponse(body);
        };
        return next();
      }
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cacheData[key] = body;
        saveCacheToFile();
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
      alert("switch on Cache Enabled first.");
    }
  } else if (type === "loadCache") {
    loadCache = !loadCache;
  }
  return { cacheEnabled, cacheAlways, loadCache };
};

const deleteCache = () => {
  cacheData = {};
  saveCacheToFile();
  return Object.keys(cacheData).length === 0;
};

const getCache = () =>
  Object.keys(cacheData).map((key) => ({ key, data: cacheData[key] }));

const getCacheState = () => ({ cacheEnabled, cacheAlways, loadCache });

module.exports = {
  cacheMiddleware,
  getCache,
  toggleCache,
  deleteCache,
  getCacheState,
};
