const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const app = express();
const fs = require("fs");
const streamifier = require("streamifier");
const port = 3002;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const db = async () => {
  try {
    //await mongoose.connect("mongodb://localhost:27017/test-nutech");
    await mongoose.connect(
      "mongodb+srv://samrmdhn:yHV7hmVE666@cluster0.laf5pqx.mongodb.net/test"
      // "mongodb://localhost:27017/test-nutech"
    );
    console.log("Db connected");
  } catch (error) {
    console.log(error);
  }
};

const { Schema, model, models, ObjectId } = mongoose;

const productSchema = new Schema(
  {
    name: String,
    description: String,
    price_sell: Number,
    price_buy: Number,
    img: String,
    stock: Number,
    categoryId: {
      type: ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model("Product", productSchema);

const categorySchema = new mongoose.Schema(
  {
    name: String,
    products: [
      {
        type: ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model("Category", categorySchema);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    img: String,
    role: String,
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", userSchema);

// MIDDLEWARE

cloudinary.config({
  cloud_name: "diyomqcnb",
  api_key: "755448266184534",
  api_secret: "ZIZ5BJz8DHv4Op919jRbNMMleOk",
});

// Multer configuration
// Configure multer storage
const storage = multer.memoryStorage();

// Create multer instance with storage configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024, // Set the file size limit to 100KB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPG images are allowed"));
    }
  },
});

const verifyUser = async (req, res, next) => {
  const { authorization } = req.headers;

  console.log(req.headers);

  console.log(authorization);

  if (!authorization)
    return res
      .status(403)
      .json({ message: "You're not allowed access this" })
      .end();

  const splitAuthorization = authorization.split(" ");

  const [authorizationType, token] = [
    splitAuthorization[0],
    splitAuthorization[1],
  ];

  if (authorizationType !== "Bearer")
    return res
      .status(400)
      .json({ message: "Authorization type is wrong" })
      .end();
  if (token === " ")
    return res.status(400).json({ message: "Token is empty" }).end();

  jwt.verify(token, "yHV7hmVE666!!!", (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Token not match" }).end();
    } else {
      console.log(decoded.role);
      if (decoded.role !== "admin") return res.status(403).end();
      next();
    }
  });
};

const register = async (req, res) => {
  const { email, name, password, img } = req.body;

  await db();

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    return res
      .status(400)
      .json({
        message: "Email already exists",
      })
      .end();
  }

  const saltRounds = 10;

  const salt = bcrypt.genSaltSync(saltRounds);

  const hashedPassword = bcrypt.hashSync(password, salt);

  const draftUser = {
    email,
    name,
    password: hashedPassword,
    role: "user",
    img,
  };

  try {
    const user = await User.create(draftUser);

    const tokenDraft = {
      id: user?._id,
      name: user.name,
      img: user.img,
      role: user.role,
    };

    const token = jwt.sign(tokenDraft, "yHV7hmVE666!!!", { expiresIn: "1h" });

    res.status(201).json({
      code: 200,
      message: "Success create user",
      token: token,
    });
  } catch (error) {
    res.status(400).end();
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  await db();

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      res
        .status(400)
        .json({
          message: "User not found",
        })
        .end();
    } else {
      const match = bcrypt.compareSync(password, user.password);

      if (!match) {
        res.status(400).json({ message: "Pasword not match" }).end();
      } else {
        const tokenDraft = {
          id: user._id,
          name: user.name,
          img: user.img,
          role: user.role,
        };

        const token = jwt.sign(tokenDraft, "yHV7hmVE666!!!", {
          expiresIn: "1d",
        });

        res.status(200).json({
          code: 200,
          message: "Success login",
          token: token,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
};

const getProducts = async (req, res) => {
  await db();
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 8;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const products = await Product.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .populate({
        path: "categoryId",
        select: "name",
      });

    res.status(200).json({
      code: 200,
      data: products,
      pagination: {
        page,
        totalPages,
        itemsPerPage,
        totalItems: totalProducts,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

const searchProducts = async (req, res) => {
  await db();

  try {
  } catch (error) {}
};

const getProductsById = async (req, res) => {
  const { id } = req.params;
  await db();
  try {
    const product = await Product.findById({ _id: id }).populate({
      path: "categoryId",
      select: "name",
    });

    res.status(200).json({
      code: 200,
      data: product,
    });
  } catch (error) {
    res.status(400).end();
  }
};

//TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received an instance of Object
const createProduct = async (req, res) => {
  const { name, description, price_sell, price_buy, stock, categoryId } =
    req.body;

  const file = req.file;

  console.log(req.body);

  console.log(file);

  await db();

  try {
    const sameProductName = await Product.findOne({ name: name });

    if (sameProductName)
      return res
        .status(400)
        .json({ message: "Product name is already exists" });

    //    const tempFilePath = `temp_${Date.now()}`;

    // Write the file buffer to the temporary file
    //  fs.writeFileSync(tempFilePath, file.buffer);
    //  const imgURL = await cloudinary.v2.uploader.upload(req.file.path);
    const stream = await cloudinary.uploader.upload_stream(
      { folder: "nutech" },
      async (error, result) => {
        if (error) return console.log(error);
        const product = await Product.create({
          name,
          description,
          price_sell,
          price_buy,
          img: result.url,
          stock,
          categoryId,
        });
        //647f64edb94f22b273968d66
        const category = await Category.findById({ _id: categoryId });

        category.products.push(product._id);

        await product.save();
        await category.save();

        res.status(201).json({
          code: 201,
          message: "Product successfully created",
          data: product,
        });
      }
    );

    //   fs.unlinkSync(tempFilePath);
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({
        error: error,
      })
      .end();
  }
};

const updateProducts = async (req, res) => {
  const { id } = req.params;

  const { name, description, price_sell, price_buy, stock, categoryId } =
    req.body;

  const file = req.file;

  console.log(req.body);

  console.log(file);

  await db();

  try {
    const sameProductName = await Product.findOne({ name: name });

    let imgFix = "";

    const productImg = await Product.findById({ _id: id });

    if (!file) {
      imgFix = productImg.img;
    } else {
      const tempFilePath = `temp_${Date.now()}`;

      // Write the file buffer to the temporary file
      fs.writeFileSync(tempFilePath, file.buffer);
      //  const imgURL = await cloudinary.v2.uploader.upload(req.file.path);
      const imgURL = await cloudinary.uploader.upload(tempFilePath, {
        folder: "nutech", // Specify the folder name in your Cloudinary account
      });

      imgFix = imgURL.url;

      fs.unlinkSync(tempFilePath);
    }

    const product = await Product.findByIdAndUpdate(id, {
      name: name,
      description: description,
      price_sell: price_sell,
      price_buy: price_buy,
      img: imgFix,
      stock: stock,
      categoryId: categoryId,
    });

    const findProduct = await Product.findById(product._id);

    res.status(200).json({
      code: 200,
      message: "Product successfully updated",
      data: findProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
};

const deleteProducts = async (req, res) => {
  const { id } = req.params;

  console.log(id);

  await db();

  try {
    const product = await Product.findByIdAndDelete({ _id: id });

    await Category.updateMany({ products: id }, { $pull: { products: id } });

    res.status(200).json({
      code: 200,
      message: "Product successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;

  await db();

  try {
    const category = await Category.create({ name });

    res.status(201).json({
      code: 201,
      message: "Category successfully created",
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
};

const getCategory = async (req, res) => {
  await db();

  try {
    const category = await Category.find().select("name");

    res.status(200).json({
      code: 200,
      message: "Success get all category",
      data: category,
    });
  } catch (error) {
    res.status(400).end();
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;

  const { name } = req.body;

  await db();

  try {
    const category = await Category.findByIdAndUpdate(id, { name: name });

    const findCategory = await Category.findById({ _id: category.id });

    res.status(200).json({
      code: 200,
      message: "Category successfully updated",
      data: findCategory,
    });
  } catch (error) {
    res.status(400).end();
  }
};

// INITIAL
app.get("/", (req, res) => {
  res.json({
    name: "API v1",
    stacks: {
      framework: "Epress.js",
      database: "MongoDB Atlas",
    },
    depedencies: {
      bcrypt: "^5.1.0",
      cloudinary: "^1.37.0",
      cors: "^2.8.5",
      express: "^4.18.2",
      jsonwebtoken: "^9.0.0",
      mongodb: "^5.6.0",
      mongoose: "^7.2.2",
      multer: "^1.4.5-lts.1",
      "node-fetch": "^3.3.1",
      nodemon: "^2.0.22",
    },
  });
});

// REGISTER
app.post("/api/v1/register", register);

// LOGIN
app.post("/api/v1/login", login);

// CREATE PRODUCT

app.post("/api/v1/products", upload.single("image"), verifyUser, createProduct);

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
app.post("/api/v1/category", verifyUser, createCategory);

// READ CATEGORY
app.get("/api/v1/category", getCategory);

// DELETE CATEGORY
app.put("/api/v1/category/:id", verifyUser, updateCategory);

module.exports = app;
