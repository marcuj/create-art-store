# Create - API Documentation
This API retrieves information on items that are listed, sold, and bought in Create.
Additionally, the API handles user logins, registration, buying items, and listing items for sale.


## Retrieving Listed Items
**Endpoint:** `/listings`

**Description:** Get a list of items listed on Create with optional filtering criteria (described below in params).
Each item can be filtered by title, price, category, seller, and ID. If no filters, returns all listed items.

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Params**:
|Param|Description|
|:---|:---|
| search | String (*optional*) <br> Get items by keyword(s) within title or category, case insensitive
| upperPrice | Integer (*optional*) <br> The upper limit on price of items, must be integer greater than 0 |
| lowerPrice | Integer (*optional*) <br> The lower limit on price of items, must be integer greater than 0 |
| category | String (*optional*) <br> Get items by category, can be category ID or exact category name |
| username | String (*optional*) <br> Get items by seller username, giving items listed by user with that username |
| id | Integer (*optional*) <br> Get item by listing ID |


**Example Request:** `/listings?search=green&lowerPrice=50&category=painting`

**Example Response:**

```json
[{
    "id": 3,
    "title": "Green Countryside Landscape Oil Painting",
    "price": 65.99, 
    "stock": 5,
    "category": "painting", 
    "username": "painter34",
    "description": "Lovely green landscape oil painting with trees and such I guess."
},
{
    "id": 43,
    "title": "Tropical Green Bird on Branch",
    "price": 50, 
    "stock": 7,
    "category": "painting", 
    "username": "painter52",
    "description": "Tropical bird with green feathers sitting on a branch in a rainforest."
}]

```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Given parameter(s) does not exist."
- Occurs when given category, username, or listing ID does not exist


## Retrieving Categories
**Endpoint:** `/category`

**Description:** Get category information by given ID and returns the category display name. Or, returns list of all categories if ID is not specified in the parameters.

**Request Type:** `GET`

**Returned Data Format**: `TEXT` or `JSON`

**Params**:
|Param|Description|
|:---|:---|
| id | Integer (*optional*) <br> Get category by ID |


**Example Request:** `/category?id=digital-print`

**Example Response:**

```
Digital Print
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Category ID does not exist."
- Occurs when given category ID does not exist


## Retrieving Transactions
**Endpoint:** `/transactions`

**Description:** Get a list of transactions completed on Create with optional ability to specify listing ID, seller ID, and buyer ID. Gives date and transaction cost.

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Params**:
|Param|Description|
|:---|:---|
| id | Integer (*optional*) <br> Get transaction by ID |
| listingID | Integer (*optional*) <br> Get transactions by listing ID |
| sellerUser | String (*optional*) <br> Get transactions by seller's username |
| buyerUser | String (*optional*) <br> Get transactions by buyer's username |

**Example Request:** `/transactions?listingID=2&sellerUser=painter52`

**Example Response:**

```json
[{
    "id": 1,
    "listingID": 2,
    "sellerUser": "painter52",
    "buyerUser": "painter34",
    "cost": 50.00, 
    "date": "2024-05-26 23:04:05"
},
{
    "id": 6,
    "listingID": 2,
    "sellerUser": "painter52",
    "buyerUser": "painter10",
    "cost": 50.00, 
    "date": "2024-05-28 16:22:50"
}]

```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Given parameter(s) does not exist."
- Occurs when given buyer username, seller username, transaction ID, or listing ID does not exist

## Retrieving Previous Login
**Endpoint:** `/storage`

**Description:** Gets cookie storing previous logged in username.

**Request Type:** `GET`

**Returned Data Format**: `TEXT`

**Params:** None


**Example Request:** `/storage`

**Example Response:**

```
painter52
```

## Making a Listing
**Endpoint:** `/listings/add`

**Description:** Adds a listing to the store from the given parameters.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Body Params**:

|Param|Description|
|:---|:---|
| title | String (*required*) <br> Title of the item being listed |
| price | Number (*required*) <br> Price of the item being listed |
| stock | Integer (*required*) <br> Initial stock of the item being listed |
| category | String (*required*) <br> Category of the item being listed |
| username | Integer (*required*) <br> Username of the user listing the item |
| description | String (*required*) <br> Description of the item being listed |
| image | String (*required*) <br> Image URL for the item being listed |

**Example Request:** `/listings/add

**Example Response:**

```
Item # 5 listed.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the six parameters

`400` error: "User does not exist"
- Occurs when the given seller username does not exist


## Create New Transaction
**Endpoint:** `/transactions/add`

**Description:** Creates a new transaction associated to the given listing, seller, and buyer. Returns the updated stock amount for the bought item

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Body Params**:
|Param|Description|
|:---|:---|
| listingID | Integer (*required*) <br> The listing ID of the item being purchased |
| cost | Number (*required*) <br> Amount spent by the buyer for the transaction |
| sellerUser | Integer (*required*) <br> Username of the user who listed the item |
| buyerUser | Integer (*required*) <br> Username of the user who purchased the item |

**Example Request:** `/transactions/add`

**Example Response:**

```
5
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the four parameters

`400` error: "Given parameter(s) does not exist"
- Occurs when listing ID does not exist or buyer username does not exist

`400` error: "Item out of stock."
- Occurs when item is out of stock


## User Login
**Endpoint:** `/login`

**Description:** Verifies given credentials to allow a user to login to their store account. Returns username.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Body Params**:
|Param|Description|
|:---|:---|
| username | String (*required*) <br> Username of user's account |
| password | String (*required*) <br> Password of account associated to given username |

**Example Request:**

`/login`

**Example Response:**

```
painter52
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading to database fails

`400` error: "Missing required parameters."
- Occurs when request is missing one of the two parameters

`400` error: "Incorrect username or password."
- Occurs when login fails, username doesn't exist or password is incorrect


## Logging Out
**Endpoint:** `/logout`

**Description:** Clears the cookie that stores the previous username logged in.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**: None

**Example Request:**

`/logout`

**Example Response:**

```
Logout successful.
```

## Create New User
**Endpoint:** `/register`

**Description:** Registers an account to the store with given username and password.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Body Params**:
|Param|Description|
|:---|:---|
| username | String (*required*) <br> Username for user's new account |
| password | String (*required*) <br> Password of new account |

**Example Request:**

`/register`

**Example Response:**

```
Account created.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required parameters."
- Occurs when request is missing one of the two parameters

`400` error: "Username is taken."
- Occurs when given username already has an account