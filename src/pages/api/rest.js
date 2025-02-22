const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.get("/rest", async (req, res) => {
  if (req.query.simulateError === "true") {
    return res.status(500).send("Simulated backend error");
  } else {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "rest fail" });
    }
  }
});
module.exports = router;
