CREATE TABLE users (
	username TEXT,
	email TEXT,
	password TEXT,
	PRIMARY KEY(username)
);

CREATE TABLE listings (
	id INTEGER,
	title TEXT,
	price REAL,
	category TEXT REFERENCES categories,
	username TEXT REFERENCES users,
	description TEXT,
	image TEXT,
	PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE stocks (
	id INTEGER REFERENCES listings,
	stock INTEGER,
	PRIMARY KEY(id)
);

CREATE TABLE transactions (
	id TEXT,
	listingID INTEGER REFERENCES listings,
	sellerUser TEXT REFERENCES users,
	buyerUser TEXT REFERENCES users,
	cost REAL,
	date DATETIME DEFAULT (datetime('now','localtime')),
	PRIMARY KEY(id)
);

CREATE TABLE categories (
	id TEXT,
	name TEXT,
	PRIMARY KEY(id)
);