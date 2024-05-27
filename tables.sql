CREATE TABLE users (
	username TEXT,
	password TEXT,
	PRIMARY KEY(username)
);

CREATE TABLE listings (
	id INTEGER,
	title TEXT,
	price REAL,
	stock INTEGER,
	category TEXT REFERENCES categories,
	username TEXT REFERENCES users,
	description TEXT,
	image TEXT,
	PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE transactions (
	id INTEGER,
	listingID INTEGER REFERENCES listings,
	sellerUser TEXT REFERENCES users,
	buyerUser TEXT REFERENCES users,
	cost REAL,
	date DATETIME DEFAULT (datetime('now','localtime')),
	PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE categories (
	id TEXT,
	name TEXT,
	PRIMARY KEY(id)
);