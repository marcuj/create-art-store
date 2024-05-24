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
	username TEXT REFERENCES users,
	description TEXT,
	PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE transactions (
	id INTEGER,
	listingID INTEGER REFERENCES listings,
	sellerUser TEXT REFERENCES users,
	buyerUser TEXT REFERENCES users,
	cost REAL,
	PRIMARY KEY(id AUTOINCREMENT)
);