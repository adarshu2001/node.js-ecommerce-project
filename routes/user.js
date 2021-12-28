var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req,res,next)=>{
  if (req.session.loggedIn) {
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user){
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/view-products',{products, admin:false,user,cartCount})
  })
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }
  res.render('users/login',{"loginErr":req.session.loginErr})
})
router.get('/signup',(req,res)=>{
  res.render('users/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignUp(req.body).then((response)=>{
    req.session.loggedIn = true
    req.session.user=response
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr = "Invalid Email or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProduct(req.session.user._id)
  res.render('users/cart',{user:req.session.user,products})
})
router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response)=>{
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

module.exports = router;
