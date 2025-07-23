import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";

if (env !== "production") {
  dotenv.config({ path: `.env.${env}` });
}

import express from "express";

import "./jobs";

const PORT = process.env.PORT || 4000;

const app = express();

app.get("/", (req, res) => {
  res.send("refreshed");
});

app.listen(PORT, () => {
  console.log("listening  on PORT 4000");
});
