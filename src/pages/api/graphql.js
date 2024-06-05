const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
router.get("/graphql", async (req, res) => {
  try {
    const response = await fetch("https://graphql-pokemon2.vercel.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          {
            pokemon(name: "Dragonite") {
              id
              name
              number
              image
            }
          }
        `,
      }),
    });
    const data = await response.json();
    res.json(data);
    // res.status(500).json({ error: "graphql fails" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "graphql fails" });
  }
});

module.exports = router;
