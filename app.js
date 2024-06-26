/*
 * Name: Marcus Jundt
 * Date: 5/28/2024
 * Section: CSE 154 AE
 *
 * This app.js file defines the express API which communicates with the database for the Create
 * website. Has endpoints to get current cookies, item listings, transactions, categories, and
 * functionality for logging in, logging out, registering accounts, and adding new items to the
 * database.
 *
 * The API retrieves information on items that are listed, sold, and bought in Create.
 * Additionally, the API handles user logins, registration, buying items, and listing
 * items for sale.
 */

"use strict";

const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// for application/json
app.use(express.json());

// for multipart/form-data (required with FormData)
app.use(multer().none());

const USER_ERROR = 400;
const API_ERROR = 500;
const OK = 200;
const PORT_NUM = 8000;
const CODE_LEN = 5;

/*
 * Gets item listings according to (if they exist in the query) search query,
 * upper/lower bound on price, category, username which listed the item, and listing ID.
 */
app.get("/listings", async (req, res) => {
  try {
    let search = req.query.search;
    let upperPrice = req.query.upperPrice;
    let lowerPrice = req.query.lowerPrice;
    let category = req.query.category;
    let username = req.query.username;
    let id = req.query.id;

    let db = await getDBConnection();

    let idExists = await valueExists(db, "listings", "id", id);
    let userExists = await valueExists(db, "users", "username", username);
    let catExists = await valueExists(db, "categories", "id", category);

    if ((id && !idExists) || (username && !userExists) || (category && !catExists)) {
      res.type("text");
      res.status(USER_ERROR).send("Given parameter value(s) does not exist.");
    } else {
      let sql = createListingSQL(search, upperPrice, lowerPrice, category, username, id);
      let items = await db.all(sql[0], sql[1]);
      await db.close();
      res.json(items);
    }
  } catch (err) {
    res.type("text");
    res.status(API_ERROR).send("Something went wrong on the server. Please try again later.");
  }
});

// Gets all categories or category by given ID in the query parameters.
app.get("/category", async (req, res) => {
  try {
    let id = req.query.id;
    let db = await getDBConnection();

    if (id) {
      res.type("text");
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
    res.type("text");
    res.status(API_ERROR).send("Something went wrong on the server. Please try again later.");
  }
});

/*
 * Gets transactions according to (if they exist in the query) transaction ID,
 * listing ID, seller username, and buyer username.
 */
app.get("/transactions", async (req, res) => {
  try {
    if (req.cookies.user) {
      let id = req.query.id;
      let listingID = req.query.listingID;
      let sellerUser = req.query.sellerUser;
      let buyerUser = req.query.buyerUser;
      let db = await getDBConnection();
      let listingIDExists = await valueExists(db, "listings", "id", listingID);
      let buyerExists = await valueExists(db, "users", "username", buyerUser);
      let sellerExists = await valueExists(db, "users", "username", sellerUser);
      let idExists = await valueExists(db, "transactions", "id", id);
      if ((id && !idExists) || (listingID && !listingIDExists) || (sellerUser && !sellerExists) ||
        (buyerUser && !buyerExists)) {
        await db.close();
        res.type("text").status(USER_ERROR)
          .send("Given parameter value(s) does not exist.");
      } else {
        let items = await execTransactionSQL(db, listingID, sellerUser, buyerUser, id);
        res.json(items);
      }
    } else {
      res.type("text").status(USER_ERROR)
        .send("Must be logged in.");
    }
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

// Gets current website cookies.
app.get("/storage", (req, res) => {
  res.type("text").send(req.cookies.user);
});

/*
 * Adds listing to database from given title, price, stock, category, seller username, description,
 * and image.
 */
app.post("/listings/add", async (req, res) => {
  try {
    let response = null;
    if (req.cookies.user) {
      let title = req.body.title;
      let price = req.body.price;
      let stock = req.body.stock;
      let cat = req.body.category;
      let user = req.body.username;
      let desc = req.body.description;
      let image = req.body.image;
      if (!title || !price || !stock || !cat || !user || !desc || !image) {
        response = [USER_ERROR, "Missing required parameters."];
      } else {
        response = await getListReponse([title, price, cat, user, desc, image, stock]);
      }
    } else {
      response = [USER_ERROR, "Must be logged in."];
    }
    res.type("text").status(response[0])
      .send(response[1]);
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

// Creates transaction for an item for the given users, listing ID, and cost.
app.post("/transactions/add", async (req, res) => {
  try {
    let response = null;
    if (req.cookies.user) {
      let listID = req.body.listingID;
      let cost = req.body.cost;
      let sellerUser = req.body.sellerUser;
      let buyerUser = req.body.buyerUser;
      if (!listID || !cost || !sellerUser || !buyerUser) {
        response = [USER_ERROR, "Missing required parameters."];
      } else {
        response = await getTransactionResponse(listID, sellerUser, buyerUser, cost);
      }
    } else {
      response = [USER_ERROR, "Must be logged in."];
    }
    res.type("text").status(response[0])
      .send(response[1]);
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

// Verifies user login credentials and remembers the login if the option is checked.
app.post("/login", async (req, res) => {
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
        let date = new Date();
        if (req.body["remember-me"]) {
          date.setDate(date.getDate() + 7);
        } else {
          date.setDate(date.getDate() + 1);
        }
        res.cookie("user", username, {expires: date});
        res.send(login.username);
      } else {
        res.status(USER_ERROR).send("Incorrect username or password.");
      }
    }
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

// Clears the cookie that stores the previous username logged in.
app.post("/logout", (req, res) => {
  try {
    if (req.cookies.user) {
      res.clearCookie("user");
      res.type("text").send("Logout successful.");
    } else {
      res.type("text").status(USER_ERROR)
        .send("Must be logged in.");
    }
  } catch (err) {
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

// Registers the given username with given password.
app.post("/register", async (req, res) => {
  try {
    res.type("text");
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    if (!username || !password || !email) {
      res.status(USER_ERROR).send("Missing required parameters.");
    } else {
      let db = await getDBConnection();
      let userExists = await valueExists(db, "users", "username", username);
      let emailExists = await valueExists(db, "users", "email", email);

      if (userExists) {
        await db.close();
        res.status(USER_ERROR).send("Username is taken.");
      } else if (emailExists) {
        await db.close();
        res.status(USER_ERROR).send("Email is already registered with an account.");
      } else {
        let sqlInsert = "INSERT INTO users(username, password) VALUES(?, ?)";
        await db.run(sqlInsert, [username, password]);
        await db.close();
        res.send("Account created.");
      }
    }
  } catch (err) {
    console.log(err);
    res.type("text").status(API_ERROR)
      .send("Something went wrong on the server. Please try again later.");
  }
});

/**
 * Gets response for adding listing when logged in and no missing parameters in request
 * @param {Array} item - [title, price, cat, user, desc, image, stock] of item - array b/c linter
 * @returns {Array} - [code, message] response to send back
 */
async function getListReponse(item) {
  let response = null;
  let db = await getDBConnection();
  let userExists = await valueExists(db, "users", "username", item[3]);
  let catExists = await valueExists(db, "categories", "id", item[2]);
  if (userExists && catExists) {
    let lastID = await insertListingStock(db, [item[0], item[1], item[2],
        item[3], item[4], item[5], item[6]]);
    response = [OK, "Item # " + lastID + " listed."];
  } else {
    response = [USER_ERROR, "Given parameter value(s) does not exist."];
  }
  await db.close();
  return response;
}

/**
 * Gets response for adding transaction when logged in and no missing parameters in request
 * @param {Number} listID - listing ID
 * @param {String} sellerUser - seller username
 * @param {String} buyerUser - buyer username
 * @param {Number} cost - transaction cost
 * @returns {Array} - [code, message] response to send back
 */
async function getTransactionResponse(listID, sellerUser, buyerUser, cost) {
  let response = null;
  let db = await getDBConnection();
  let existCheck = await transactionValuesExists(db, listID, sellerUser, buyerUser);
  if (!existCheck[0] || !existCheck[1]) {
    response = [USER_ERROR, "Given parameter value(s) does not exist."];
  } else if (existCheck[0].stock === 0) {
    response = [USER_ERROR, "Item out of stock."];
  } else {
    let newID = await genUniqueCode(db);
    let stock = await insertTransaction(db, newID, listID, sellerUser, buyerUser, cost);
    response = [OK, stock + " " + newID];
  }
  await db.close();
  return response;
}

/**
 * Checks if value exists in the given table in the given database.
 * @param {sqlite3.Database} db - database to check
 * @param {String} table - table to check
 * @param {String} column - column to check
 * @param {*} value - desired column value
 * @returns {Boolean} - whether the value exists
 */
async function valueExists(db, table, column, value) {
  if (!value) {
    return false;
  }
  let sqlCheck = "SELECT * FROM " + table + " WHERE " + column + " = ? LIMIT 1";
  let userExists = await db.all(sqlCheck, [value]);
  return userExists.length !== 0;
}

/**
 * Checks if the values (listing ID and usernames) exist when adding transaction.
 * @param {sqlite3.Database} db - database
 * @param {Number} listingID - listing ID
 * @param {String} sellerUser - seller username
 * @param {String} buyerUser - buyer username
 * @returns {Array} - [listing exists, buyer username exists]
 */
async function transactionValuesExists(db, listingID, sellerUser, buyerUser) {
  let sqlListingCheck = "SELECT stocks.stock FROM listings, stocks WHERE " +
    "listings.id = stocks.id AND listings.id = ? AND listings.username = ? LIMIT 1";
  let listingExists = await db.get(sqlListingCheck, [listingID, sellerUser]);
  let userExists = await valueExists(db, "users", "username", buyerUser);
  return [listingExists, userExists];
}

/**
 * Creates the SQL query for getting listings. Parameters are optional
 * @param {String} search - search query
 * @param {Number} upperPrice - upper bound on price
 * @param {Number} lowerPrice - lower bound on price
 * @param {String} category - item cateogory
 * @param {String} username - seller username
 * @param {Number} id - listing ID
 * @returns {Array} - [SQL query, placeholder values]
 */
function createListingSQL(search, upperPrice, lowerPrice, category, username, id) {
  let sql = "SELECT * FROM listings, stocks WHERE listings.id = stocks.id AND";
  let placeholders = [];
  if (search) {
    placeholders.push("%" + search + "%", "%" + search + "%");
    sql += " (title LIKE ? or category LIKE ?) AND";
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
  }
  if (username) {
    placeholders.push(username);
    sql += " username = ? AND";
  }
  if (id) {
    placeholders.push(id);
    sql += " listings.id = ? AND";
  }
  sql = sql.substring(0, sql.lastIndexOf(" ")) + " ORDER BY listings.id DESC";
  return [sql, placeholders];
}

/**
 * Executes SQL query for getting transactions. Parameters are optional. Returns transaction list.
 * @param {sqlite3.Database} db - database
 * @param {Number} listingID - listing ID
 * @param {String} sellerUser - seller username
 * @param {String} buyerUser - buyer username
 * @param {Number} id - transaction ID
 * @returns {Array} - list of transaction objects
 */
async function execTransactionSQL(db, listingID, sellerUser, buyerUser, id) {
  let sql = "SELECT * FROM transactions WHERE";
  let placeholders = [];

  if (listingID) {
    placeholders.push(listingID);
    sql += " listingID < ? AND";
  }
  if (sellerUser) {
    placeholders.push(sellerUser);
    sql += " sellerUser > ? AND";
  }
  if (buyerUser) {
    placeholders.push(buyerUser);
    sql += " buyerUser = ? AND";
  }
  if (id) {
    placeholders.push(id);
    sql += " id = ? AND";
  }
  let ind = sql.lastIndexOf(" ");
  sql = sql.substring(0, ind);
  sql += " ORDER BY DATETIME(date) DESC";
  let items = await db.all(sql, placeholders);
  await db.close();
  return items;
}

/**
 * Inserts listing and the stock to the database.
 * @param {sqlite3.Database} db - database
 * @param {Array} item - item info
 * @returns {Number} - row ID of inserted listing
 */
async function insertListingStock(db, item) {
  let sql = "INSERT INTO listings(title, price, category, username, description, image) " +
    "VALUES(?, ?, ?, ?, ?, ?)";
  let data = await db.run(sql, [item[0], item[1], item[2], item[3], item[4], item[5]]);
  let sqlID = "SELECT id FROM listings WHERE rowid = ?";
  let id = await db.get(sqlID, [data.lastID]);
  let sqlStock = "INSERT INTO stocks VALUES(?, ?)";
  await db.run(sqlStock, [id.id, item[6]]);
  return data.lastID;
}

/**
 * Inserts tranasction into the database and returns the new stock for item bought.
 * @param {sqlite3.Database} db - database
 * @param {String} newID - tranasction confirmation code
 * @param {Number} listingID - listing ID for item bought
 * @param {String} sellerUser - seller of item
 * @param {String} buyerUser - buyer of item
 * @param {Number} cost - cost of item
 * @returns {Number} - new item stock amount
 */
async function insertTransaction(db, newID, listingID, sellerUser, buyerUser, cost) {
  let sqlInsert = "INSERT INTO transactions(id, listingID, sellerUser, buyerUser, cost) " +
    "VALUES(?, ?, ?, ?, ?)";
  await db.run(sqlInsert, [newID, listingID, sellerUser, buyerUser, cost]);
  let sqlLowerStock = "UPDATE stocks SET stock = stock - 1 WHERE id = ?";
  await db.run(sqlLowerStock, [listingID]);
  let sqlGetStock = "SELECT stock FROM stocks WHERE id = ?";
  let stock = await db.get(sqlGetStock, [listingID]);
  return stock.stock;
}

/**
 * Generates unique transaction confirmation code with length defined by class constant above.
 * @param {sqlite3.Database} db - database
 * @returns {String} - unique confirmation code
 */
async function genUniqueCode(db) {
  let code;
  let notUnique = true;
  while (notUnique) {
    code = genConfirmationCode();
    notUnique = await valueExists(db, "transactions", "id", code);
  }
  return code;
}

/**
 * Generates transaction confirmation code with length defined by class constant above.
 * Idea from https://sentry.io/answers/generate-random-string-characters-in-javascript/
 * @returns {String} - confirmation code
 */
function genConfirmationCode() {
  let options = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "T";
  for (let i = 0; i < CODE_LEN; i++) {
    code += options.charAt(Math.floor(Math.random() * CODE_LEN));
  }
  return code;
}

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
