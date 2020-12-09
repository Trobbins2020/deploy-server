require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const movies = require("./data/movies-data-small.json");
// const movies = require("./data/movies-data.json");

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.get("/movie", (req, res) => {
  let result = movies;
  const { genre, country, avg_vote } = req.query;
  if (genre) {
    result = result.filter((e) =>
      e.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    result = result.filter((e) =>
      e.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (avg_vote) {
    result = result.filter((e) => Number(avg_vote) <= Number(e.avg_vote));
  }

  res.json(result);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT);
