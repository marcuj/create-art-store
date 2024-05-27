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
    let id = req.query.id;

    let db = await getDBConnection();

    let sql = "SELECT * FROM listings WHERE";
    let placeholders = [];

    if (search) {
      search = "%" + search + "%";
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
    if (id) {
      placeholders.push(id);
      sql += " id = ? AND";
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
      "name = ? ORDER BY DATETIME(date) DESC"; // ORDER BY DATE YES!
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
    res.type("text");
    let listingID = req.body.listingID;
    let cost = req.body.cost;
    let sellerUser = req.body.sellerUser;
    let buyerUser = req.body.buyerUser;

    let db = await getDBConnection();
    let sqlListingCheck = "SELECT stock FROM listings WHERE id = ? AND username = ? LIMIT 1";
    let listingExists = await db.get(sqlListingCheck, [listingID, sellerUser]);
    let sqlUserCheck = "SELECT username FROM users WHERE username = ? LIMIT 1";
    let userExists = await db.get(sqlUserCheck, [buyerUser]);

    if (!listingExists) {
      await db.close();
      res.status(USER_ERROR).send("Listing ID does not exist.");
    } else if (!userExists) {
      await db.close();
      res.status(USER_ERROR).send("Invalid buyer username.");
    } else if (listingExists.stock === 0) {
      await db.close();
      res.status(API_ERROR).send("Item out of stock.")
    } else {
      let sqlInsert = "INSERT INTO transactions(listingID, sellerUser, buyerUser, cost) VALUES(?, ?, ?, ?)";
      await db.run(sqlInsert, [listingID, sellerUser, buyerUser, cost]);
      let sqlLowerStock = "UPDATE listings SET stock = stock - 1 WHERE id = ?";
      await db.run(sqlLowerStock, [listingID]);
      let sqlGetStock = "SELECT stock FROM listings WHERE id = ?";
      let stock = await db.get(sqlGetStock, [listingID]);
      await db.close();
      res.send(stock.stock + "");
    }
  } catch (err) {
    res.type('text').status(API_ERROR)
      .send('Something went wrong on the server. Please try again later.');
  }
});

// Verifies user log in credentials
app.post('/login', async (req, res) => {
  try {
    res.type("text");
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
      res.status(USER_ERROR).send("Missing required parameters.");
    } else {
      let db = await getDBConnection();
      let sql = "SELECT username FROM users WHERE username = ? AND password = ?";
      let login = await db.get(sql, [username, password]);
      await db.close();

      if (login) {
        res.send(login.username);
      } else {
        res.status(USER_ERROR).send("Incorrect username or password.");
      }
    }
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send('Something went wrong on the server. Please try again later.');
  }
});

// Registers user
app.post('/register', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

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
