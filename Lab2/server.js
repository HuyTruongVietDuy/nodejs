// Khai báo sử dụng express
const express = require('express');
const app = express();
const port = 3000;

// Sử dụng express.urlencoded() để xử lý dữ liệu POST
app.use(express.urlencoded({ extended: true }));

// Cấu hình EJS làm template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Cấu hình phục vụ tài nguyên tĩnh từ thư mục public
app.use(express.static("public"));

// Khai báo tuyến đường GET cho trang chính
app.get("/", (req, res) => {
    var today = new Date();
    currentDay = today.getDay();
    var day = '';
    switch (currentDay) {
        case 0:
            day = 'Chủ nhật';
            break;
        case 1:
            day = 'Thứ hai';
            break;
        case 2:
            day = 'Thứ ba';
            break;
        case 3:
            day = 'Thứ tư';
            break;
        case 4:
            day = 'Thứ năm';
            break;
        case 5:
            day = 'Thứ sáu';
            break;
        case 6:
            day = 'Thứ bảy';
            break;
        default:
            console.log(`Error: ${currentDay}`);
    }
    res.render('home', { kindOfDay: day });
});

//data
var listProduct=[
    {id:1,title:'Apple Book',price:2,description:"A very interesting book about so many even more interesting things!",imageURL:"book.jpg",},
    {id:2,title:'Microsoft Book',price:2000,description:"A very interesting book about so many even more interesting things!",imageURL:"book.jpg",},
    {id:3,title:'VFast Book',price:1000,description:"A very interesting book about so many even more interesting things!",imageURL:"book.jpg",}];

app.get("/shop",(req,res)=>{
    res.render('shop',{products:listProduct});
    })

app.get("/add-product", (req, res) => {
        res.render("add-product");
    });
    
var multer=require('multer');
//khai báo sử dụng multer
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+'-'+file.originalname )
    }
    })
var upload = multer({ storage: storage })

app.post('/addnew', upload.single('productImage'),(req, res) => {
    //lấy dữ liệu từ form sau khi upload anh
    const file = req.file
    let title=req.body.productName;
    let price=req.body.price;
    let description=req.body.description;
    let nameImage=file.filename;
    //Thêm vào mảng json 1 cuối sách mới
    listProduct.push({
    id:1,
    title:title,
    price:price,
    description:description,
    imageURL:nameImage,
    })
    //chuyển về trang sản phẩm
    res.redirect('/shop');
});

// Define a function to retrieve product details
function getProductDetails(productId) {
    // Implement the logic to retrieve product details from your data source
    // Return the product details as an object, or an empty object if not found
    // For example:
    const product = listProduct.find(product => product.id === productId);

    if (product) {
        return product;
    } else {
        return {}; // Return an empty object when the product is not found
    }
}

// Define a single route for product detail
app.get("/product/:productId", (req, res) => {
    // Lấy thông tin sản phẩm từ mã sản phẩm (productId)
    const productId = req.params.productId;

    // Gọi hàm getProductDetails để lấy thông tin sản phẩm
    const product = getProductDetails(parseInt(productId)); // Convert productId to an integer

    if (product) {
        // Truyền thông tin sản phẩm cho trang chi tiết (sử dụng EJS)
        res.render("product-detail", { product: product });
    } else {
        // Handle the case when the product is not found
        res.status(404).send("Product not found");
    }
});


// Lắng nghe trên cổng 3000
app.listen(port, () => {
    console.log(`Ứng dụng đang chạy với port: ${port}`);
});
