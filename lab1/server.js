const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded());


app.get('/', (req, res) =>{
    res.send(`<h1> Đây là trang home </h1>`)
})

app.get('/product', (req, res) =>{
    res.send(`<h1> Đây là trang sản phẩm </h1>`)        
})

app.listen(port, () => {
    console.log(`<p> Ứng dụng này đang chạy với host là: ${port} </p>` )
})

//data
const inventors = [
    { id:1, first: 'Albert', last: 'Einstein', year: 1879, passed: 1955 },
    { id:2, first: 'Isaac', last: 'Newton', year: 1643, passed: 1727 },
    { id:3, first: 'Galileo', last: 'Galilei', year: 1564, passed: 1642 },
    { id:4, first: 'Marie', last: 'Curie', year: 1867, passed: 1934 },
    { id:5, first: 'Johannes', last: 'Kepler', year: 1571, passed: 1630 },
    { id:6, first: 'Nicolaus', last: 'Copernicus', year: 1473, passed: 1543 }
    ];


    

// Route và xử lý dữ liệu trả về cho trang danh sách nhà khoa hoc

app.get('/inventors', (req, res) => {
    // Sắp xếp danh sách inventors theo thứ tự ABC theo trường 'last'
    const sortedInventors = inventors.slice().sort((a, b) => {
        if (a.last < b.last) return -1;
        if (a.last > b.last) return 1;
        return 0;
    });

    let list = '<h2> Danh sách nhà khoa học <ul>';
    sortedInventors.forEach(e => {
        list += `<li><a style="text-decoration:none;color:green;" href="/confirm/${e.id}">${e.last}</a></li>`;
    });
    list += '</ul></h2>';
    res.send(list);
});

// Xác nhận trước khi chuyển đến trang chi tiết
app.get('/confirm/:id', (req, res) => {
    const inventorId = req.params.id;
    // Lấy thông tin về người phát minh dựa trên inventorId
    // Đảm bảo bạn có một biến inventors chứa thông tin về các nhà khoa học
    const inventor = inventors.find(inv => inv.id == inventorId);

    if (inventor) {
        res.send(`
            <h2>Xác nhận</h2>
            <p>Bạn có muốn xem chi tiết về nhà khoa học ${inventor.last} không?</p>
            <button onclick="showConfirmation('${inventor.id}')">Yes</button>
            <button onclick="returnToInventors()">No</button>
            <script>
                function showConfirmation(inventorId) {
                    if (confirm('Bạn có muốn xem chi tiết không?')) {
                        window.location.href = '/inventor/' + inventorId;
                    }
                }
                function returnToInventors() {
                    window.location.href = '/inventors';
                }
            </script>
        `);
    } else {
        res.status(404).send('Không tìm thấy nhà khoa học');
    }
});

// Route và xử lý dữ liệu request (req.params) cho trang chi tiết nhà khoa học

app.get('/inventor/:id', (req, res) => {
    let id=req.params.id;
    inventor=inventors.find(e=>e.id==id);
    info=`<h2>Thông tin chi tiết nhà khoa học:Full name: ${inventor.first} ${inventor.last}, Year: ${inventor.year},
   Passed: ${inventor.passed}</h2>`;
    res.send(info);
   });


//

app.get('/add-inventor', (req, res) => {
    res.send(`<h1>Thêm Nhà Khoa Học</h1><form action="/inventor" method="POST"><input type="text"
   name="first" placeholder="input first name"><input type="text" name="last" placeholder="input last name"><br><input
   type="number" name="year" placeholder="Year"><input type="number" name="passed"
   placeholder="passed"><br><button type="submit">Add Product</button></form>`);
   });


   app.post('/inventor', (req, res) => {
    let newInventor=req.body;
    newInventor.id=inventors.length+1;
    inventors.push(newInventor);
    res.redirect('/inventors');
   });