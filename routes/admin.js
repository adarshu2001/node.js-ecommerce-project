var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const { route } = require('./user');
var router = express.Router();


/* GET admin listing. */
router.get('/', function(req, res, next) {
      res.render('admin/dashboard',{admin:true})
})
// router.get('/', function(req, res, next) {
//   if (req.session.adminLoggedIn){
//     productHelpers.getAllProducts().then((products)=>{
//       res.render('admin/view-products',{products, admin:true})
//     })

//   }else{
//     res.redirect('/admin/admin-login')
//   }
 
// });

router.get('/view-brand',async(req,res)=>{
  let brand = await productHelpers.getAllBrand()
  res.render('admin/view-brand',{admin:true,brand})
})

router.get('/add-brand',(req,res)=>{
  res.render('admin/add-brand',{admin:true})
})
router.post('/add-brand',(req,res)=>{
  console.log(req.body);
  console.log(req.files.Image);
  productHelpers.addBrand(req.body).then((id) => {
    let image = req.files.Image
    image.mv('public/brand-img/' + id + '.jpg', (err,done) => {
      if (!err) {
        res.redirect('/admin/view-brand')
      }else {
        res.redirect('/admin/add-brand')
      }
    })
  })
})

router.get('/edit-brand/:id',async(req,res)=>{
  let id = req.params.id
  let edit = await productHelpers.editBrand(id)
  res.render('admin/edit-brand',{admin:true,edit})
})

router.post('/edit-brand/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.updateBrand(req.body,id).then(()=>{
    res.redirect('/admin/view-brand')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('public/brand-img/' + id + '.jpg')
    }
  })
})

// router.get('delete-brand',(req,res)=>{
  
// })



router.get('/view-category',(req,res)=>{
  productHelpers.categoryDetails().then((categories)=> {
    res.render('admin/view-category',{admin:true,categories})
  })
})
router.get('/add-category',(req,res)=>{
  res.render('admin/add-category',{admin:true})
})
router.post('/add-category',(req,res)=>{
  productHelpers.addCategory(req.body).then((response)=>{
    res.redirect('/admin/view-category')
  })
})

router.get('/view-products',(req,res)=>{
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products',{admin:true,products})
  })
  
})

router.get('/add-product',async(req,res)=>{
  let brand = await productHelpers.getAllBrand()
  let category = await productHelpers.categoryDetails()
  res.render('admin/add-product',{admin:true,brand,category})
})
// router.post('/add-product',(req,res)=>{
//   console.log(req.body);
//   productHelpers.addProduct(req.body).then((id)=>{
//     let img1 = req.files.img1
//     let img2 = req.files.img2
//     let img3 = req.files.img3
//     let img4 = req.files.img4
//     image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
//       if (!err) {
//         res.render('admin/add-product')
//       }else{
//         console.log(err);
//       }
//     })
//   })
// })
router.post('/add-product',(req,res)=>{
  console.log(req.body);
  productHelpers.addProduct(req.body).then((id)=>{
    let img1 = req.files.img1
    let img2 = req.files.img2
    let img3 = req.files.img3
    let img4 = req.files.img4

    img1.mv('public/product-images/' + id + 'a.jpg')
    img2.mv('public/product-images/' + id + 'b.jpg')
    img3.mv('public/product-images/' + id + 'c.jpg')
    img4.mv('public/product-images/' + id + 'd.jpg')
    res.redirect('/admin/view-products')
  }).catch((err)=>{
    if (err) {
      res.redirect('/admin/add-product')
    }

  })
})
router.get('/delete-product/:id',async(req,res)=>{
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id',async(req,res)=>{
  let proId = req.params.id
  let brand = await productHelpers.getAllBrand()
  let category = await productHelpers.categoryDetails()
  let product = await productHelpers.getEditProduct(proId)
    res.render('admin/edit-product',{product,admin:true,category,brand})
})
router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    // res.redirect('/admin')
    if(req.files.img1){
      let img1 = req.files.img1
      img1.mv('./public/product-images/'+id+ 'a.jpg')
    }else{
      res.redirect('/admin/view-products')
    }
    if(req.files.img2){
      let img2 = req.files.img2
      img2.mv('./public/product-images/'+id+ 'b.jpg')
    }else {
      res.redirect('/admin/view-products')
    }
    if(req.files.img3){
      let img3 = req.files.img3
      img3.mv('./public/product-images/'+id+ 'c.jpg')
    }else {
      res.redirect('/admin/view-products')
    }
    if(req.files.img4){
      let img4 = req.files.img4
      img4.mv('./public/product-images/'+id+ 'd.jpg')
    }else {
      res.redirect('/admin/view-products')
    }
  })
  res.redirect('/admin/view-products')
})
router.get('/admin-login',(req,res)=>{
  if (req.session.adminLoggedIn){
    res.redirect('/admin/admin-login',{"logginErr":req.session.logginErr})
  }
  res.render('admin/admin-login',{admin:true})
})
router.get('/admin-signup',(req,res)=>{
  res.render('admin/signup')
})
router.post('/admin-signup',(req,res)=>{
  productHelpers.adminDoSignup(req.body).then((response)=>{
  
  })

})
router.post('/admin-login',(req,res)=>{
  productHelpers.adminDoLogin(req.body).then((responseAdmin)=>{
    if (responseAdmin.status) {
      req.session.admin = responseAdmin.admin
      req.session.adminLoggedIn = true
      console.log("This is Admin");
      res.redirect('/admin')
    }else{
      req.session.logginErr = true
    }
  })
})

router.get('/view-user',async(req,res)=>{
  let allUsers = await productHelpers.getAllUsers()
  console.log(allUsers);
  res.render('admin/view-user',{admin:true,allUsers})
})

router.get('/block-user/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.blockUser(id).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.get('/unblock-user/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.unblockUser(id).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.get('/blocked-users',(req,res)=>{
  productHelpers.getBlockedUSers().then((blockedUsers)=>{
    console.log(blockedUsers);
    res.render('admin/blocked-users',{admin:true,blockedUsers})
  })
})

router.get('/product-offer',async(req,res) => {
  let products = await productHelpers.getAllProducts()
  let getProductOffer = await productHelpers.getProductOffer()
  console.log(getProductOffer);
  res.render('admin/product-offer',{admin:true,products,getProductOffer})
})
router.post('/product-offer',(req,res) => {
  productHelpers.productOffer(req.body).then(()=>{
    res.redirect('/admin/product-offer')
  })
})
router.get('/deleteOffer/:id',(req,res) => {
  let offerId = req.params.id
  productHelpers.deleteOffer(offerId).then(()=> {
    res.redirect('/admin/product-offer')
  })

})

router.get('/coupon-offer',async(req,res)=> {
  let coupon = await productHelpers.getAllCoupon()
  console.log((coupon));
  res.render('admin/coupon-offer',{admin: true,coupon})
})
router.post('/coupon-offer',(req,res) => {
  productHelpers.addCoupon(req.body).then(() => {
    res.redirect('/admin/coupon-offer')
  })
 
})
router.get('/delete-coupon/:id',(req,res) => {
  let id = req.params.id
  productHelpers.deleteCoupon(id).then((response) => {
    res.redirect('/admin/coupon-offer')
  })
 
})

router.get('/orders',async(req,res) => {
  let orderList = await productHelpers.getAllOrders()
  res.render('admin/all-orders',{admin: true,orderList})
})

router.get('/placed/:id',(req,res) => {
  let id = req.params.id
  let status = 'Placed'
  productHelpers.changeOrderStatus(id,status).then(() => {
    res.redirect('/admin/orders')
  }) 
})

router.get('/shipped/:id',(req,res) => {
  let id = req.params.id
  let status = 'Shipped'
  productHelpers.changeOrderStatus(id,status).then(() => {
    res.redirect('/admin/orders')
  }) 
})
router.get('/delivered/:id',(req,res) => {
  let id = req.params.id
  let status = 'Delivered'
  productHelpers.changeOrderStatus(id,status).then(() => {
    res.redirect('/admin/orders')
  }) 
})
router.get('/cancelled/:id',(req,res) => {
  let id = req.params.id
  let status = 'Cancelled'
  productHelpers.changeOrderStatus(id,status).then(() => {
    res.redirect('/admin/orders')
  }) 
})








module.exports = router;
