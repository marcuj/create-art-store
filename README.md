# Create - Ecommerce Art Website ([demo](https://create-art-store-20f32e760c2a.herokuapp.com/))
An ecommerce website for buying and selling art.

## Features

- Search and filter items available to purchase on the main page
- Click on an item to view more details and purchase
- Login or create a new account
- List new items for sale and view previously listed items
- View previous transactions and purchased items

## How it works

Uses AJAX in [`index.js`](public/index.js) to fetch the store information from an Express app [`app.js`](app.js). The Express app defines an API that uses `sqlite3` to communicate with a database [`create.db`](create.db) (see [`APIDOC.md`](APIDOC.md) for more information). The SQL file [`tables.sql`](tables.sql) shows the create table functions used to make the `sqlite` database. The database stores information on user logins, item listings (and their stock), transactions, and item categories. The database is already filled with example items to showcase functionality of the site. 

Uses cookies to remember previous login and stores previous username to autofill when logging in. Currently designed to only handle a single login at a time.

Hosted with [Heroku](https://www.heroku.com/).

