/*
 * Name: Marcus Jundt
 * Date: 5/17/2024
 * Section: CSE 154 AE
 *
 * This app.js file
 *
 * This API
 */

"use strict";

const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const app = express();

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// for application/json
app.use(express.json());

// for multipart/form-data (required with FormData)
app.use(multer().none());

const USER_ERROR = 400;
const API_ERROR = 500;
const PORT_NUM = 8000;

// Get listings
app.get('/listings', async (req, res) => {
  try {
    let search = req.query.search;
    let upperPrice = req.query.upperPrice;
    let lowerPrice = req.query.lowerPrice;
    let category = req.query.category;
    let username = req.query.username;

    let db = await getDBConnection();

    let sql = "SELECT * FROM listings WHERE";
    let placeholders = [];

    if (search) {
      placeholders.push(search);
      sql += " title LIKE ? AND";
    }
    if (upperPrice) {
      placeholders.push(upperPrice);
      sql += " price < ? AND";
    }
    if (lowerPrice) {
      placeholders.push(lowerPrice);
      sql += " price > ? AND";
    }
    if (category) {
      placeholders.push(category);
      sql += " category = ? AND";
      // check if category exist
    }
    if (username) {
      placeholders.push(username);
      sql += " username = ? AND";
      // check if username exist
    }
    let ind = sql.lastIndexOf(" ");
    sql = sql.substring(0, ind);
    let items = await db.all(sql, placeholders);
    await db.close();
    res.json(items);

    // user error codes
    
  } catch (err) {
    res.type('text');
    res.status(API_ERROR).send('Something went wrong on the server. Please try again later.');
  }
});

// Get categories
app.get('/category', async (req, res) => {
  try {
    let id = req.query.id;
    let db = await getDBConnection();

    if (id) {
      res.type("text")
      let sql = "SELECT name FROM categories WHERE id = ?";
      let name = await db.get(sql, [id]);
      await db.close();
      if (!name) {
        res.status(USER_ERROR).send("Category ID does not exist.");
      } else {
        res.send(name.name);
      }
    } else {
      let sql = "SELECT * FROM categories";
      let cats = await db.all(sql);
      await db.close();
      res.json(cats);
    }
  } catch (err) {
    res.type('text');
    res.status(API_ERROR).send('Something went wrong on the server. Please try again later.');
  }
});

// Get transactions
app.get('/transactions', async (req, res) => {
  try {
    let listingID = req.query.listingID;
    let sellerUser = req.query.sellerUser;
    let buyerUser = req.query.buyerUser;

    let db = await getDBConnection();

    let sql = "SELECT name, yip, hashtag, date FROM yips WHERE " +
      "name = ? ORDER BY DATETIME(date) DESC";
    let yips = await db.all(sql, [user]);
    await db.close();
    if (!yips) {
      res.type("text").status(USER_ERROR)
        .send("Yikes. User does not exist.");
    } else {
      res.json(yips);
    }
  } catch (err) {
    res.type('text');
    res.status(API_ERROR).send('Something went wrong on the server. Please try again later.');
  }
});

// Add listing
app.post('/listings/add', async (req, res) => {
  try {
    res.type('text');

    let title = req.body.title;
    let price = req.body.price;
    let stock = req.body.stock;
    let category = req.body.category;
    let username = req.body.username;
    let description = req.body.description;

    let db = await getDBConnection();

    let sql = "UPDATE yips SET likes = likes + 1 WHERE id = ?";
    let yips = await db.run(sql, [id]);
    let sqlLikes = "SELECT likes FROM yips WHERE id = ?";
    let likes = await db.get(sqlLikes, [id]);
    await db.close();
    if (yips.changes === 0) {
      res.status(USER_ERROR)
        .send("Yikes. ID does not exist.");
    } else {
      res.send(likes.likes + "");
    }
  } catch (err) {
    res.type('text');
    res.status(API_ERROR).send('Something went wrong on the server. Please try again later.');
  }
});

// Adds transaction
app.post('/transactions/add', async (req, res) => {
  try {
    let listingID = req.body.listingID;
    let cost = req.body.cost;
    let sellerUser = req.body.sellerUser;
    let buyerUser = req.body.buyerUser;

    let db = await getDBConnection();
    let sqlCheck = "SELECT name FROM yips WHERE name = ? LIMIT 1";
    let nameExists = await db.get(sqlCheck, [name]);

    if (nameExists) {
      let sqlInsert = "INSERT INTO yips(name, yip, hashtag, likes) VALUES(?, ?, ?, 0)";
      let data = await db.run(sqlInsert, [name, yip, hashtag]);
      let sqlGet = "SELECT * FROM yips WHERE id = ?";
      let row = await db.get(sqlGet, [data.lastID]);
      await db.close();
      res.json(row);
    } else {
      await db.close();
      res.type("text").status(USER_ERROR)
        .send("Yikes. User does not exist.");
    }
  } catch (err) {
    res.type('text').status(API_ERROR)
      .send('Something went wrong on the server. Please try again later.');
  }
});

// Verifies user log in credentials
app.post('/login', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let db = await getDBConnection();
    let sqlCheck = "SELECT name FROM yips WHERE name = ? LIMIT 1";
    let nameExists = await db.get(sqlCheck, [name]);

    if (nameExists) {
      let sqlInsert = "INSERT INTO yips(name, yip, hashtag, likes) VALUES(?, ?, ?, 0)";
      let data = await db.run(sqlInsert, [name, yip, hashtag]);
      let sqlGet = "SELECT * FROM yips WHERE id = ?";
      let row = await db.get(sqlGet, [data.lastID]);
      await db.close();
      res.json(row);
    } else {
      await db.close();
      res.type("text").status(USER_ERROR)
        .send("Yikes. User does not exist.");
    }
  } catch (err) {
    res.type('text').status(API_ERROR)
      .send('Something went wrong on the server. Please try again later.');
  }
});

// Registers user
app.post('/register', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let db = await getDBConnection();
    let sqlCheck = "SELECT name FROM yips WHERE name = ? LIMIT 1";
    let nameExists = await db.get(sqlCheck, [name]);

    if (nameExists) {
      let sqlInsert = "INSERT INTO yips(name, yip, hashtag, likes) VALUES(?, ?, ?, 0)";
      let data = await db.run(sqlInsert, [name, yip, hashtag]);
      let sqlGet = "SELECT * FROM yips WHERE id = ?";
      let row = await db.get(sqlGet, [data.lastID]);
      await db.close();
      res.json(row);
    } else {
      await db.close();
      res.type("text").status(USER_ERROR)
        .send("Yikes. User does not exist.");
    }
  } catch (err) {
    res.type('text').status(API_ERROR)
      .send('Something went wrong on the server. Please try again later.');
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * Took from CSE 154 Lecture 24 slides.
 * @returns {sqlite3.Database} - database object for the connection
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "create.db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);
