const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "http://reccomendationsh.s3-website.eu-west-2.amazonaws.com",
};
app.use(cors(corsOptions));
require("dotenv").config(); // Load environment variables from .env file
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.json());
const { body, validationResult } = require("express-validator");
const port = process.env.PORT || 3000;
const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DB_URL,
});

app.get("/", function (req, res) {
  res.status(200).json("Welcome");
});

// GET "/videos" with optional order query
app.get("/videos", async function (req, res) {
  const order = req.query.order;

  try {
    let query = "SELECT * FROM videos";
    if (order === "asc") {
      query += " ORDER BY rating ASC";
    } else if (order === "desc") {
      query += " ORDER BY rating DESC";
    }

    const result = await db.query(query);
    if (result.rows.length === 0) {
      return res.json([]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching videos:", error); // Log error for debugging
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Adding a new video
app.post(
  "/videos",
  [
    body("title", "Title can't be empty").notEmpty(),
    body("url", "URL can't be empty").notEmpty(),
    body("rating", "Rating can't be empty").notEmpty(),
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
        console.error("Error adding video:", err); // Log error for debugging
        res.status(500).send("Internal Server Error");
      } else {
        const createdVideo = result.rows[0];
        res.status(201).json(createdVideo);
      }
    });
  }
);

// Search video by title
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

// Get video by ID
app.get("/videos/:id", async function (req, res) {
  const videoId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM videos WHERE id=$1", [videoId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No videos found" });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching video by ID:", error); // Log error for debugging
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update video rating by ID
app.put("/videos/:id", async function (req, res) {
  const newId = req.params.id;
  const newRating = req.body.rating;
  try {
    const result = await db.query("UPDATE videos SET rating=$2 WHERE id=$1", [
      newId,
      newRating,
    ]);
    res.json(`Video with ID:${newId} updated`);
  } catch (error) {
    console.error("Error updating video rating:", error); // Log error for debugging
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Delete video by ID
app.delete("/videos/:id", async function (req, res) {
  const videoId = req.params.id;
  try {
    const result = await db.query("DELETE FROM videos WHERE id=$1", [videoId]);
    if (result.rowCount === 0) {
      return res.status(404).json(`Video with ID ${videoId} not found`);
    }
    res.json(`Video with ID ${videoId} deleted`);
  } catch (error) {
    console.error("Error deleting video:", error); // Log error for debugging
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
