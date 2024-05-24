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
| username | String (*optional*) <br> Get items by seller username, giving items listed by user with that username


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

`400` error: "Category does not exist" or "Username does not exist"
- Occurs when given category or seller username does not exist


## Transactions
**Endpoint:** `/transactions`

**Description:** Get a list of transactions completed on Create with optional ability to specify listing ID, seller ID, and buyer ID. Gives date and transaction cost.

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Params**:
|Param|Description|
|:---|:---|
| listingID | Integer (*optional*) <br> Get transactions by listing ID |
| sellerUser | String (*optional*) <br> Get transactions by seller's username |
| buyerUser | String (*optional*) <br> Get transactions by buyer's username |

**Example Request:** `/transactions?listingID=3&sellerUser=painter34`

**Example Response:**

```json
[{
    "listingID": 3,
    "cost": 65.99, 
    "sellerUser": "painter34",
    "buyerUser": "buyer1"
},
{
    "listingID": 3,
    "cost": 65.99, 
    "sellerID": "painter34",
    "buyerID": "buyer2"
}]

```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading database fails

`400` error: "Buyer username does not exist" or "Seller username does not exist" or "Listing ID does not exist"
- Occurs when given buyer username, seller username, or listing ID does not exist


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
| username | Integer (*required*) <br> Username of the user listing the item |
| description | String (*required*) <br> Description of the item being listed |

**Example Request:** `/listings/add?title=Green+Bird&price=52.99&stock=5&category=painting&username=painter32&description=Painting+of+green+bird`

**Example Response:**

```
Item "Green Bird" is listed for sale.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the six parameters

`400` error: "Username does not exist"
- Occurs when the given seller username does not exist


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
| sellerUser | Integer (*required*) <br> Username of the user who listed the item |
| buyerUser | Integer (*required*) <br> Username of the user who purchased the item |

**Example Request:** `/transactions/add?listingID=3&cost=59&sellerUser=painter34&buyerID=buyer1`

**Example Response:**

```
Transaction of item 3 completed.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the four parameters

`400` error: "Buyer username does not exist" or "Seller username does not exist" or "Listing ID does not exist"
- Occurs when given buyer username, seller username, or listing ID does not exist


## User Login
**Endpoint:** `/login`

**Description:** Verifies given credentials to allow a user to login to their store account.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:
|Param|Description|
|:---|:---|
| username | String (*required*) <br> Username of user's account |
| password | String (*required*) <br> Password of account associated to given username |

**Example Request:** Username: mjundt2, Password: cheese

`/login?username=mjundt2&password=cheese`

**Example Response:**

```
Login successful.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the two parameters

`400` error: "Username is not associated with an existing account"
- Occurs when given username doesn't have an account

`400` error: "Incorrect password"
- Occurs when password is incorrect for the account associated with given username


## Create New User
**Endpoint:** `/register`

**Description:** Registers an account to the store with given username and password.

**Request Type:** `POST`

**Returned Data Format**: `TEXT`

**Params**:
|Param|Description|
|:---|:---|
| username | String (*required*) <br> Username for user's new account |
| password | String (*required*) <br> Password of new account |

**Example Request:** Username: mjundt2, Password: cheese

`/transactions?username=mjundt2&password=cheese`

**Example Response:**

```
Registration with username "mjundt2" successful.
```

**Error Handling:**

`500` error: "Something went wrong on the server. Please try again later."
- Occurs when reading/writing to database fails

`400` error: "Missing required params"
- Occurs when request is missing one of the two parameters

`400` error: "Username is already associated with an existing account"
- Occurs when given username already has an account