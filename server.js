const express = require("express");
const mysql = require("mysql2/promise");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB URI and database setup
const mongoUri =
  "mongodb+srv://mshai9:Goldfish32@cs480-project2.ilcs2.mongodb.net/?retryWrites=true&w=majority&appName=cs480-project2";
let mongoClient;

// Connect to MongoDB
MongoClient.connect(mongoUri)
  .then((client) => {
    mongoClient = client;
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Movies endpoint
app.get("/api/v1/movies", async (req, res) => {
  try {
    const db = mongoClient.db("sample_mflix");
    const collection = db.collection("movies");

    const query = {};

    if (req.query.genre) query.genres = req.query.genre;
    if (req.query.year) query.year = parseInt(req.query.year);
    if (req.query.director) query.director = req.query.director;

    const movies = await collection.find(query).limit(10).toArray();

    res.json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/colors", async (req, res) => {
  try {
    const db = mongoClient.db("cs480-project2"); // Replace with your database name
    const collection = db.collection("colors");

    const colors = await collection.find({}).toArray();
    res.json(colors);
  } catch (err) {
    console.error("Error fetching colors:", err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.post("/api/v1/colors", async (req, res) => {
  try {
    const db = mongoClient.db("cs480-project2"); // Replace with your database name
    const collection = db.collection("colors");

    const newColor = req.body; // Expect a JSON body
    const result = await collection.insertOne(newColor);

    res
      .status(201)
      .json({ message: "Color added successfully.", id: result.insertedId });
  } catch (err) {
    console.error("Error adding color:", err);
    res.status(500).json(["An error has occurred."]);
  }
});

// GET - Return all fields for the specified document
app.get("/api/v1/colors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = mongoClient.db("cs480-project2");
    const collection = db.collection("colors");

    const color = await collection.findOne({ _id: new ObjectId(id) });
    if (!color) {
      res.json([]);
    } else {
      res.json(color);
    }
  } catch (err) {
    console.error("Error fetching color:", err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.put("/api/v1/colors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = mongoClient.db("cs480-project2");
    const collection = db.collection("colors");

    const updatedColor = req.body; // Expect a JSON body
    const result = await collection.replaceOne(
      { _id: new ObjectId(id) },
      updatedColor
    );

    if (result.matchedCount === 0) {
      res.json([]);
    } else {
      res.json({ message: "Color updated successfully." });
    }
  } catch (err) {
    console.error("Error updating color:", err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.delete("/api/v1/colors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = mongoClient.db("cs480-project2");
    const collection = db.collection("colors");

    // Use deleteOne() instead of delete()
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    // Check if any document was deleted
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Color not found" }); // Send 404 if no document was deleted
    } else {
      res.status(200).json({ message: "Color deleted successfully" }); // Send success response
    }
  } catch (err) {
    console.error("Error deleting color:", err);
    res.status(500).json({ message: "An error has occurred." }); // Send error response
  }
});

const mysqlPool = mysql.createPool({
  host: "35.206.77.57",
  user: "480mshai9",
  password: "XTSDfkt3",
  database: "sakila",
});

app.get("/api/v1/actors", async (req, res) => {
  try {
    const [rows] = await mysqlPool.query("SELECT * FROM actor");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/films", async (req, res) => {
  const query = req.query.query; // Get the 'query' parameter from the request
  try {
    let sql = "SELECT * FROM film";
    const params = [];

    if (query) {
      // Use a WHERE clause with case-insensitive search
      sql += " WHERE LOWER(title) LIKE ?";
      params.push(`%${query.toLowerCase()}%`);
    }

    const [rows] = await mysqlPool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/customers", async (req, res) => {
  try {
    const [rows] = await mysqlPool.query("SELECT * FROM customer");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/stores", async (req, res) => {
  try {
    const [rows] = await mysqlPool.query("SELECT * FROM store");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/actors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM actor WHERE actor_id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.json([]); // Return an empty array if no match
    } else {
      res.json(rows[0]); // Return the single matching object
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/films/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM film WHERE film_id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/stores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM store WHERE store_id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM customer WHERE customer_id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/actors/:id/films", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      `SELECT film.* FROM film
        JOIN film_actor ON film.film_id = film_actor.film_id
        WHERE film_actor.actor_id = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/films/:id/actors", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      `SELECT first_name, last_name FROM actor
        JOIN film_actor ON actor.actor_id = film_actor.actor_id
        WHERE film_actor.film_id = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/films/:id/detail", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      `SELECT * FROM film_list WHERE FID = ?`,
      [id]
    );
    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("api/v1/customers/:id/detail", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      `SELECT * FROM customer_list WHERE ID = ?`,
      [id]
    );
    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

app.get("/api/v1/inventory-in-stock/:film_id/:store_id", async (req, res) => {
  const { film_id, store_id } = req.params;
  try {
    const [rows] = await mysqlPool.query(
      `CALL film_in_stock(?, ?)`, // Use the stored procedure
      [film_id, store_id]
    );

    if (rows.length === 0) {
      res.json([]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(["An error has occurred."]);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
