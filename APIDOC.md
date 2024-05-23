# Create - API Documentation
This API retrieves information on items that are listed, sold, and bought in Create.
Additionally, the API handles user logins and registration to Create.

## Retrieving Listed Items
**Endpoint:** `/listings`

**Description:** Get a list of items listed on Create with optional filtering criteria (described below in params).
Each item can be filtered by title, price, category, and seller. If no filters, returns all listed items.

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Params**:
|Param|Description|
|:---|:---|
| search | String (*optional*) <br> Get items by keyword(s) within title or category, case insensitive
| upperPrice | Integer (*optional*) <br> The upper limit on price of items, must be integer greater than 0 |
| lowerPrice | Integer (*optional*) <br> The lower limit on price of items, must be integer greater than 0 |
| category | String (*optional*) <br> Get items by category, can be category ID or exact category name |
| sellerID | Integer (*optional*) <br> Get items by seller ID, giving items listed by user with that ID


**Example Request:** `/listings?search=green&lowerPrice=50&category=painting`

**Example Response:**

```json
[{
    "listingID": 3,
    "title": "Green Countryside Landscape Oil Painting",
    "price": 65.99, 
    "stock": 5,
    "category": "painting", 
    "sellerID": 12434,
    "description": "Lovely green landscape oil painting with trees and such I guess."
},
{
    "listingID": 43,
    "title": "Tropical Green Bird on Branch",
    "price": 50, 
    "stock": 7,
    "category": "painting", 
    "sellerID": 78652,
    "description": "Tropical bird with green feathers sitting on a branch in a rainforest."
}]

```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Category does not exist" or "Seller ID does not exist"
- Occurs when given category or seller ID does not exist


## Transactions
**Endpoint:** `/transactions`

**Description:** Get a list of transactions completed on Create with optional ability to specify listing ID, seller ID, and buyer ID. Gives date and transaction cost.

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Params**:
|Param|Description|
|:---|:---|
| listingID | Integer (*optional*) <br> Get transactions by listing ID |
| sellerID | Integer (*optional*) <br> Get transactions by seller's user ID |
| buyerID | Integer (*optional*) <br> Get transactions by buyer's user ID |

**Example Request:** `/transactions?listingID=3&sellerID=12434`

**Example Response:**

```json
[{
    "listingID": 3,
    "cost": 65.99, 
    "sellerID": 12434,
    "buyerID": 89723
},
{
    "listingID": 3,
    "cost": 65.99, 
    "sellerID": 12434,
    "buyerID": 05867
}]

```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Buyer ID does not exist" or "Seller ID does not exist" or "Listing ID does not exist"
- Occurs when given buyer ID, seller ID, or listing ID does not exist


## Making a Listing
**Endpoint:** `/listings/add`

**Description:** Adds a listing to the store from the given parameters.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:

|Param|Description|
|:---|:---|
| title | String (*required*) <br> Title of the item being listed |
| price | Number (*required*) <br> Price of the item being listed |
| stock | Integer (*required*) <br> Initial stock of the item being listed |
| category | String (*required*) <br> Category of the item being listed |
| sellerID | Integer (*required*) <br> User ID of the user listing the item |
| description | String (*required*) <br> Description of the item being listed |

**Example Request:** `/listings/add?title=Green+Bird&price=52.99&stock=5&category=painting&sellerID=12432&description=Painting+of+green+bird`

**Example Response:**

```
Item "Green Bird" is listed for sale.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the six parameters

`400` error: "User ID does not exist"
- Occurs when the given seller ID does not exist


## Create New Transaction
**Endpoint:** `/transactions/add`

**Description:** Creates a new transaction associated to the given listing, seller, and buyer.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:
|Param|Description|
|:---|:---|
| listingID | Integer (*required*) <br> The listing ID of the item being purchased |
| cost | Number (*required*) <br> Amount spent by the buyer for the transaction |
| sellerID | Integer (*required*) <br> User ID of the user who listed the item |
| buyerID | Integer (*required*) <br> User ID of the user who purchased the item |

**Example Request:** `/transactions/add?listingID=3&cost=59&sellerID=12434&buyerID=65923`

**Example Response:**

```
Transaction of item 3 completed.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the four parameters

`400` error: "Buyer ID does not exist" or "Seller ID does not exist" or "Listing ID does not exist"
- Occurs when given buyer ID, seller ID, or listing ID does not exist


## User Login
**Endpoint:** `/login`

**Description:** Verifies given credentials to allow a user to login to their store account.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:
|Param|Description|
|:---|:---|
| email | String (*required*) <br> Email of user's account |
| password | String (*required*) <br> Password of account associated to given email |

**Example Request:** Email: mjundt2@uw.edu, Password: cheese

`/login?email=mjundt%40uw%2Eedu&password=cheese`

**Example Response:**

```
Login successful.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the two parameters

`400` error: "Email is not associated with an existing account"
- Occurs when given email doesn't have an account

`400` error: "Incorrect password"
- Occurs when password is incorrect for the account associated with given email


## Create New User
**Endpoint:** `/register`

**Description:** Registers an account to the store with given email and password.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:
|Param|Description|
|:---|:---|
| email | String (*required*) <br> Email for user's new account |
| password | String (*required*) <br> Password of new account |

**Example Request:** Email: mjundt2@uw.edu, Password: cheese

`/transactions?email=mjundt%40uw%2Eedu&password=cheese`

**Example Response:**

```
Registration with email "mjundt2@uw.edu" successful.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the two parameters

`400` error: "Email is already associated with an existing account"
- Occurs when given email already has an account