const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "http://reccomendationsh.s3-website.eu-west-2.amazonaws.com/",
};
app.use(cors());
require("dotenv").config(); // Load environment variables from .env file
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.json());
const { body, validationResult } = require("express-validator");
const port = process.env.PORT || 3000;
const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DB_URL,
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  //   ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false
});

//
app.get("/", function (req, res) {
  res.status(200).json("wellcome");
});

// GET "/videos"
app.get("/videos", async function (req, res) {
  const result = await db.query("SELECT * FROM videos");
  if (result.rows.length === 0) {
    return res.json([]);
  }
  res.json(result.rows);
});



//ordering by assending and dessending for example /videos?order=asc
app.get("/videos", async function (req, res) {
  try {
    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({ error: "Invalid order parameter" });
    }
    const order = req.query.order;
    let result;
    if (order === "asc") {
      result = await db.query("SELECT * FROM videos ORDER BY rating ASC");
    } else {
      result = await db.query("SELECT * FROM videos ORDER BY rating DESC");
    }
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

//adding new id
app.post(
  "/videos",
  [
    body("title", "text can't be empty").notEmpty(),
    body("url", "text can't be empty").notEmpty(),
    body("rating", " can't be empty").notEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({
        error: errors.array(),
      });
    }
    const newTitle = req.body.title;
    const newUrl = req.body.url;
    const newRating = req.body.rating;
    const query =
      "INSERT INTO videos (title, url, rating) VALUES($1, $2, $3) RETURNING *";
    db.query(query, [newTitle, newUrl, newRating], (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        const createdVideo = result.rows[0];
        res.status(201).json(createdVideo);
      }
    });
  }
);

//search video by query for example /videos/search?title=halleluja
app.get("/videos/search", function (req, res) {
  const searchVideo = req.query.title;
  const filteredVideo = videos.filter((video) =>
    video.title.toLowerCase().includes(searchVideo.toLowerCase())
  );
  if (filteredVideo.length === 0) {
    res.status(404).json({ error: "No matching videos found" });
  }
  res.json(filteredVideo);
});

//search video by id for example/videos/:id
app.get("/videos/:id", async function (req, res) {
  const videoId = req.params.id;
  const result = await db.query("SELECT * FROM videos where id=$1", [videoId]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "no videos found" });
  }
  res.json(result.rows);
});

//updating video with id
app.put("/videos/:id", async function (req, res) {
  const newId = req.params.id;
  const newRating = req.body.rating;
  try {
    const result = db.query("UPDATE videos SET rating=$2 WHERE id=$1", [
      newId,
      newRating,
    ]);
    res.json(`video with id:${newId} updated`);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//deleting video
app.delete("/videos/:id", async function (req, res) {
  const videoId = req.params.id;
  try {
    const result = await db.query("DELETE FROM videos WHERE id=$1", [videoId]);
    if (result.rowCount === 0) {
      return res.status(404).json(`Video with id ${videoId} not found`);
    }
    res.json(`Video with id ${videoId} deleted`);
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));