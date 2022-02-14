var express = require('express');
const async = require('hbs/lib/async');
const { response, render } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req,res,next)=>{
  if (req.session.userLoggedIn) {
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user = req.session.user
  let cartCount = null
  let whishlistCount = null
  if (req.session.userLoggedIn){
    whishlistCount = await userHelpers.getWhishlistCount(req.session.user._id)
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/home-page',{products, admin:false,user,cartCount,whishlistCount})
  })
});
router.get('/login',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }
  res.render('users/login',{"loginErr":req.session.userLoginErr})
  req.session.userLoginErr=false
})
router.get('/signup',(req,res)=>{
  res.render('users/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignUp(req.body).then((response)=>{
    req.session.user=response
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){  
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }else{
      req.session.userLoginErr = "Invalid Email or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user = null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let products = await userHelpers.getCartProduct(req.session.user._id)
  if (products.length>0){
     let totalSum = await userHelpers.getTotalAmount(req.session.user._id)  
     res.render('users/cart',{user:req.session.user,products,totalSum,cartCount})
  }else{
    res.render('users/cart-empty',{user:req.session.user})
  }
})
router.get('/whishlist',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getWhishProduct(req.session.user._id)
  res.render('users/whishlist',{user:req.session.user,products})
})
// router.get('/add-to-cart/:id',(req,res)=>{
//   userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
//     res.json({status:true})
//   })
// })
router.get('/add-to-cart',(req,res)=>{
  console.log(req.query);
  console.log(req.session.user._id);
  userHelpers.addToCart(req.query,req.session.user._id).then((response)=>{
     res.json({status:true})
    })
})
router.get('/add-to-whishlist',(req,res)=>{
  console.log(req.query);
  console.log(req.session.user._id);
  userHelpers.addToWhishlist(req.query,req.session.user._id).then((response)=>{
    res.json({status:true}) 
  })
})
router.post('/change-product-quantity',(req,res)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/cart-product-remove',(req,res)=>{
  userHelpers.removeCartProduct(req.body).then((response)=>{
    res.json({status:true})

  })
})
router.get('/place-order',verifyLogin ,async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order',{user:req.session.user,total})
})
router.post('/place-order',async(req,res)=>{
  let products = await userHelpers.getCartProList(req.body.userId)
  console.log("dot"+ products);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  console.log(req.body);
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        console.log("response"+response);
        res.json(response)

      })
    }
  })
})
router.get('/order-success',(req,res)=>{
  res.render('users/order-success',{user:req.session.user})
})
router.get('/orders',verifyLogin,async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('users/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
 console.log(req.body);
 userHelpers.verifyPayment(req.body).then(()=>{
   console.log("success");
   userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
     console.log("Payment Successfull");
     res.json({status:true})
   })
   
 }).catch((err)=>{
   res.json({status:false})
 })
})
router.get('/single-product/:id',verifyLogin,async(req,res)=>{
  console.log("Product Id" + req.params.id);
  let product = await userHelpers.singleProduct(req.params.id)
  console.log(product);
  let cartCount = null
   cartCount = await userHelpers.getCartCount(req.session.user._id)
  res.render('users/single-product',{user:req.session.user,product,cartCount})
})

module.exports = router;
