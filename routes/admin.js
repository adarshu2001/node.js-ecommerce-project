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
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin:true})
})
router.post('/add-product',(req,res)=>{
  // console.log(req.body);
  // console.log(req.files.Image);
  productHelpers.addProduct(req.body).then((id)=>{
    let image = req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if (!err) {
        res.render('admin/add-product')
      }else{
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id',async(req,res)=>{
  let proId = req.params.id
  let product = await productHelpers.getEditProduct(proId)
    res.render('admin/edit-product',{product})

})
router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
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







module.exports = router;
