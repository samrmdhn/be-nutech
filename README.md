<h5>CRUD PRODUCTS (ADMIN)</h5>
<h5>https://fe-nutech-samrmdhn.vercel.app/dashboard/login</h5>
<h5>Email: admin@admin.com</h5>
<h5>Password: admin</h5>

<h1>API ENDPOINTS</h1>

<h5>Login</h5>
<h5>Endpoint: /api/v1/login</h5>
<h5>Method: POST</h5>
<h5>Request Body: </h5>
    
    email (String)
    password (String)
    
<h5> Example: </h5> 

    "email": "example@example.com",
    "password": "example123"

<h5>Response: 200 OK</h5>

<br />

<h5>REGISTER</h5>
<h5>Endpoint: /api/v1/register</h5>
<h5>Method: POST </h5>
<h5>Request Body: </h5>

    email (String)
    password (String)
  
<h5> Example: </h5>

    "email": "example@example.com",
    "password": "example123"

<h5>Response: 200 OK</h5>

<br />

<h5>Products</h5>

<br />

<h5>Create</h5>
<h5>Endpoint: /api/v1/products</h5>
<h5>Method: POST</h5>
<h5>Request Body:</h5>

    name (String)
    description (String) 
    price_sell (Number)
    price_buy (Number)
    stock (Number)
    categoryId (String)
    img (File)
  
<h5>Example:</h5>

    "name" : "Haze",
    "description: "Clean",
    "price_sell": 1000,
    "price_buy": 500,
    "stock" 5,
    "categoryId": "672329fasf2",
    "img": file
   
<h5>Response: 201 OK</h5>


<br />


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

// DELETE CATEGORy
app.put("/api/v1/category/:id", updateCategory);
