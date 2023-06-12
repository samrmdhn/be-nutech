API ENDPOINTS 

app.post("/api/v1/register", register);

// LOGIN
Endpoint: /api/v1/login
Method: POST
Request Body:
  email (String)
  password (String)
Example: 
{
    "email": "example@example.com",
    "password": "example123"
}
Response: 200 OK

// REGISTER
Endpoint: /api/v1/register
Method: POST
Request Body:
  email (String)
  password (String)
Example: 
{
    "email": "example@gmail.com",
    "password": "example123"
}
Response: 200 OK

// PRODUCTS 

// CREATE
Endpoint: /api/v1/products
Method: POST
Headers: Bearer + JWT TOKEN
Request Body:
  name (String)
  description (String) 
  price_sell (Number)
  price_buy (Number)
  stock (Number)
  categoryId (String)
  img (File)
Example: 
{
    "name" : "Haze",
    "description: "Clean",
    "price_sell": 1000,
    "price_buy": 500,
    "stock" 5,
    "categoryId": "672329fasf2",
    "img": file
}
Response: 201 OK

// READ PRODUCT
app.get("/api/v1/products", getProducts);
app.get("/api/v1/products/:id", getProductsById);

// UPDATE PRODUCT
app.put(
  "/api/v1/products/:id",
  upload.single("image"),
  verifyUser,
  updateProducts
);

// DELETE PRODUCT
app.delete("/api/v1/products/:id", verifyUser, deleteProducts);

// CREATE CATEGORY
app.post("/api/v1/category", createCategory);

// READ CATEGORY
app.get("/api/v1/category", getCategory);

// DELETE CATEGORY
app.put("/api/v1/category/:id", updateCategory);
