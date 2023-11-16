const express = require("express");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
const multer = require("multer");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static("public-admin"));
const mysql = require("mysql"); // Thay đổi require statement

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 3306,
  password: "",
  database: "lab03",
});

//khai báo sử dụng multer
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
  let sql = "SELECT idCategory, nameCategory FROM catalog";
  db.query(sql, (err, listLoai) => {
    if (err) throw err;
    let sqlSach =
      "select idProduct ,nameProduct, priceProduct, images from products ";
    db.query(sqlSach, (err, listSach) => {
      if (err) throw err;
      res.render("shop", { loaiSach: listLoai, listSach: listSach });
    });
  });
  //  res.render('shop');
});

app.get("/cat/:cateid", (req, res) => {
  let id = req.params.cateid;
  let sql = `select * from catalog`;
  let sqlsach = `select * from products where idCategory = ${id}`;
  db.query(sql, function (err, listLoai) {
    db.query(sqlsach, function (err, listSach) {
      if (err) throw err;
      res.render("shop", { loaiSach: listLoai, listSach: listSach });
    });
  });
});

app.get("/chitiet/:id", (req, res) => {
  const productId = req.params.id;

  // Fetch the list of categories
  let sqlCategories = "SELECT idCategory, nameCategory FROM catalog";
  db.query(sqlCategories, (err, loaiSach) => {
    if (err) throw err;

    // Retrieve the product details based on the productId
    let sqlProduct = `SELECT * FROM products WHERE idProduct = ${productId}`;
    db.query(sqlProduct, (err, productDetails) => {
      if (err) throw err;

      // Render the detail.ejs template and pass the productDetails and loaiSach variables
      res.render("detail", { productDetails: productDetails, loaiSach: loaiSach });
    });
  });
});




// -------------------------------------------------------------------------- router lấy quản trị ---------------------------------------------------------
// phần quản trị
app.get("/admin", (req, res) => {
  res.render("admin/home");
});




// Thực hiện truy vấn SQL để lấy thông tin từ bảng catalog
app.get("/admin/listcategory", (req, res) => {
  let sql =
    "SELECT idCategory, nameCategory, dateCategory, dateEditCategory FROM catalog";

  db.query(sql, (err, listLoai) => {
    if (err) throw err;

    // Thực hiện truy vấn SQL để lấy thông tin từ bảng products
    let sqlSach =
      "SELECT idProduct, nameProduct, priceProduct, images FROM products";
    db.query(sqlSach, (err, listSach) => {
      if (err) throw err;

      // Render trang và truyền danh sách loại và sách vào template
      res.render("admin/category/sach_category", { loaiSach: listLoai });
    });
  });
});

app.get("/admin/listproduct", (req, res) => {
  // Thực hiện truy vấn SQL để lấy thông tin từ bảng products và kết hợp với bảng catalog để lấy tên loại
  let sqlSach =
    `SELECT products.idProduct, products.nameProduct, products.sortDescription, products.dateProduct, products.priceProduct, products.images, catalog.nameCategory 
    FROM products 
    LEFT JOIN catalog ON products.idCategory = catalog.idCategory`;

  db.query(sqlSach, (err, listSach) => {
    if (err) throw err;

    // Render trang và truyền danh sách sách vào template
    res.render("admin/product/sach_product", { listSach: listSach });
  });
});

app.get("/admin/listuser", (req, res) => {
  // Thực hiện truy vấn SQL để lấy thông tin từ bảng tbluser
  let sqlUsers =
    `SELECT id, fullname, username, rule FROM tbluser`;

  db.query(sqlUsers, (err, userList) => {
    if (err) throw err;

    // Render trang và truyền danh sách người dùng vào template
    res.render("admin/user/list_user", { userList: userList });
  });
});

app.get("/admin/add-category", (req, res) => {
  res.render("admin/category/sach_them");
});

// xóa tên loại

app.get("/admin/deletecategory/:id", (req, res) => {
  const idCategory = req.params.id;

  db.query(
    "DELETE FROM catalog WHERE idCategory = ?",
    idCategory,
    (err, result) => {
      if (err) throw err;
      res.redirect("/admin/listcategory");
    }
  );
});


app.post("/addnewloai", (req, res) => {
  let nameCategory = req.body.nameCategory;

  // Kiểm tra xem nameCategory có giá trị không
  if (!nameCategory) {
    return res.status(400).send("Tên loại không được để trống.");
  }

  let category = {
    nameCategory: nameCategory,
    // dateCategory sẽ tự động lấy giá trị thời gian
  };

  db.query("INSERT INTO catalog SET ?", category, function (err, data) {
    if (err) throw err;
    res.redirect("/admin/listcategory");
  });
});



app.get("/admin/editcategory/:id", (req, res) => {
  const idCategory = req.params.id;

  // Thực hiện truy vấn SQL để lấy thông tin category dựa trên idCategory
  let sql = "SELECT * FROM catalog WHERE idCategory = ?";
  db.query(sql, [idCategory], (err, category) => {
    if (err) throw err;

    // Render trang chỉnh sửa và truyền thông tin category vào template
    res.render("admin/category/sach_sua", { category: category[0] });
  });
});


// index.js
app.post("/admin/updatecategory/:id", (req, res) => {
  const idCategory = req.params.id;
  const NameCategory = req.body.nameCategory;

  // Thực hiện truy vấn SQL để cập nhật thông tin category dựa trên idCategory
  let sql = "UPDATE catalog SET nameCategory = ? WHERE idCategory = ?";
  db.query(sql, [NameCategory, idCategory], (err, result) => {
    if (err) throw err; 

    // Sau khi cập nhật, chuyển hướng về trang danh sách category
    res.redirect("/admin/listcategory");
  });
});


// Thực hiện truy vấn SQL để Thêm thông tin từ bảng products
app.get("/admin/add-product", (req, res) => {
  let sql = "SELECT idCategory, nameCategory FROM catalog";
  db.query(sql, (err, categories) => {
    if (err) throw err;
    res.render("admin/product/sach_them", { categories: categories });
  });
});




app.post("/addnew", upload.single("productImage"), (req, res) => {
  const file = req.file;
  let title = req.body.productName;
  let price = req.body.price;
  let description = req.body.description;
  let nameImage = file.filename;
  let categoryId = req.body.categoryId; // Thêm dòng này để lấy id danh mục từ form.

  let product = {
    nameProduct: title,
    priceProduct: price,
    sortDescription: description,
    images: nameImage,
    idCategory: categoryId, // Thêm id danh mục vào sản phẩm.
  };

  db.query("INSERT INTO products SET ?", product, function (err, data) {
    if (err) throw err;
    res.redirect("/admin/listproduct");
  });
});

// Thực hiện truy vấn SQL để Xóa thông tin từ bảng products
app.get("/admin/deleteproduct/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    "DELETE FROM products WHERE idProduct = ?",
    productId,
    (err, result) => {
      if (err) throw err;
      res.redirect("/admin/listproduct");
    }
  );
});

// Thực hiện truy vấn SQL để sửa thông tin từ bảng products
app.get("/admin/editproduct/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    "SELECT * FROM products WHERE idProduct = ?",
    productId,
    (err, result) => {
      if (err) throw err;

      // Lấy danh sách các danh mục từ bảng catalog
      let sql = "SELECT idCategory, nameCategory FROM catalog";
      db.query(sql, (err, categories) => {
        if (err) throw err;

        // Render trang sửa và truyền thông tin sản phẩm và danh sách danh mục vào template
        res.render("admin/product/sach_sua", { product: result[0], categories: categories });
      });
    }
  );
});


app.post("/admin/updateproduct/:id", upload.single("productImage"), (req, res) => {
  const productId = req.params.id;
  let title = req.body.productName;
  let price = req.body.price;
  let description = req.body.description;
  let categoryId = req.body.categoryId;

  // Kiểm tra xem có file được chọn không
  let nameImage;
  if (req.file) {
    // Nếu có file, lấy tên file
    nameImage = req.file.filename;
  }

  let updatedProduct = {
    nameProduct: title,
    priceProduct: price,
    sortDescription: description,
    idCategory: categoryId,
  };

  // Nếu có file, thêm trường images vào updatedProduct
  if (nameImage) {
    updatedProduct.images = nameImage;
  }

  db.query(
    "UPDATE products SET ? WHERE idProduct = ?",
    [updatedProduct, productId],
    (err, result) => {
      if (err) throw err;
      res.redirect("/admin/listproduct");
    }
  );
});


// find name product

app.post("/admin/search-product", (req, res) => {
  // Lấy từ khóa tìm kiếm từ phần thân của yêu cầu
  const searchQuery = req.body.search;

  // Thực hiện truy vấn SQL để tìm kiếm sản phẩm theo tên
  let sql = "SELECT * FROM products WHERE nameProduct LIKE ?";
  
  // Sử dụng `%` để bao quanh từ khóa tìm kiếm, để lấy các sản phẩm có tên chứa từ khóa
  const searchTerm = `%${searchQuery}%`;

  // Thực hiện truy vấn cơ sở dữ liệu
  db.query(sql, [searchTerm], (err, filteredProducts) => {
      if (err) throw err;

      // Truyền giá trị cho biến listSach và render template
      res.render("admin/product/sach_product", { listSach: filteredProducts, searchQuery: searchQuery });
  });
});





app.listen(port, () => {
  console.log("Ưng dụng đang chạy với port: " + port);
});
