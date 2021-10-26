const express = require('express')
const { insertToDB, getAll, deleteObject, getDocumentById, updateDocument,dosearch,category} = require('./databaseHandler')
const morgan=require('morgan');
const app = express();
const path= require('path');
const handlebars  = require('express-handlebars');
//http logger
app.use(morgan('combined'))
//temple engine

app.engine('hbs', handlebars({
    extname: '.hbs',
}));
app.set('view engine','hbs')
app.set('views',path.join(__dirname,'views'));



app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))


app.use(express.urlencoded({ extended: true }))

app.get('/',async (req, res)=>{
     var result = await getAll("Products")
    res.render('home', { products: result })
})

app.post('/insert', async (req, res) => {
     const name = req.body.txtName
     const price = req.body.txtPrice
     const url = req.body.txtImage
     const category = req.body.txtCategory
     if (url.length == 0) {
         var result = await getAll("Products")
         res.render('insert', { products: result, urlError: 'Phai nhap Image URL!'})
     }
     else if (name.trim().length == 0) {
        res.render('insert', { nameError: "You not input Name!" })} 
        //check not number
      else if (isNaN(price)) {
        res.render('insert', { nameError: null, priceError: "Only Number" });
        return false;
    };
    //check not input negative numbers
    if (price < 1 &&price>8) {
        res.render('insert', { nameError: null, priceError: "Price greater than 0 and smaller 8" });
        return false;
    }
    else if (category.trim().length == 0){
        res.render('insert', { categoryError:"you must enter a category"})
    }
     else{
        
         //xay dung doi tuong insert
         const obj = { name: name, price: price,category:category, image: url }
         //goi ham de insert vao DB
         await insertToDB(obj, "Products")
         res.redirect('/')
     }
 })
// search 
app.post('/search', async (req, res) => {
        const searchText =req.body.txtName;
        const result = await dosearch(searchText,"Products")
        res.render('home',{products:result})
})
//delete one product (id)
app.get('/delete/:id', async (req, res) => {
     const idValue = req.params.id
     //viet ham xoa object dua tren id
     await deleteObject(idValue, "Products")
     res.redirect('/')
 })
//category
 app.post('/category',async (req, res)=>{
    const categorya=req.body.txtName;
    const result = await category(categorya,"Products")
    res.render('home',{products:result})
})

app.get('/edit/:id', async (req, res) => {
     const idValue = req.params.id
     //lay thong tin cu cua sp cho nguoi dung xem, sua
     const productToEdit = await getDocumentById(idValue, "Products")
     //hien thi ra de sua
     res.render("edit", { product: productToEdit })
 })
 
app.get('/edits', (req, res)=>{
    res.render('edit')
})
app.get('/addproduct',  (req, res) => {
    res.render('insert')
})

app.post('/update', async (req, res) => {
     const id = req.body.txtId
     const name = req.body.txtName
     const price = req.body.txtPrice
     const image = req.body.txtImage
     const category = req.body.txtCategory
     let updateValues = { $set: { name: name, price: price,category:category,image: image }};
     await updateDocument(id, updateValues, "Products")
     res.redirect('/')
});


const PORT= process.env.PORT || 5000;
app.listen(PORT);
console.log('server running :',PORT);