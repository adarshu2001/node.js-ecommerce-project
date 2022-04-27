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


const serviceSID = "VAa5825b37fce8ba7f9023f34ea97a84de"
const accountSID = "AC02f399e851af5313a6e373d3a99f44ca"
const authToken = "762626242967808e1f44c8e9deeda7a9"
const client = require('twilio')(accountSID, authToken)

/* GET home page. */
router.get('/',async function(req, res, next) {
  let banners = await productHelpers.getHomeBanners()
  let latestPro = await productHelpers.latestPro()
  let user = req.session.user
  let cartCount = null
  let whishlistCount = null
  if (req.session.userLoggedIn){
    whishlistCount = await userHelpers.getWhishlistCount(req.session.user._id)
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('users/home-page',{products, admin:false,user,cartCount,whishlistCount,banners,latestPro})
  })
  
});

router.get('/single-product/:id',verifyLogin,async(req,res)=>{
  let relatedPro = await userHelpers.relatedProduct(req.params.id)
  console.log(relatedPro);
  let product = await userHelpers.singleProduct(req.params.id)
  let cartCount = null
   cartCount = await userHelpers.getCartCount(req.session.user._id)
  res.render('users/single-product',{user:req.session.user,product,cartCount,relatedPro})
})

router.get('/men',async(req,res) => {
  let forMen = await userHelpers.getMenProducts()
  res.render('users/men-collection',{forMen})
})
router.get('/women',async(req,res) => {
  let forWomen = await userHelpers.getWomenProducts()
  res.render('users/women-collection',{forWomen})
})
router.get('/kid',async(req,res) => {
  let forKid = await userHelpers.getKidProducts()
  res.render('users/kid-collection',{forKid})
})

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
// router.post('/signup',(req,res)=>{
//   let num = req.body.Phone
//   let mobile = `+91${num}`
//   userHelpers.getUserDetails(mobile).then((user)=>{
//     if (user) {
//       req.session.userExist = true
//       res.redirect('/signup')
//     }else {
//       userHelpers.doSignUp(req.body).then((user)=>{
//         client.verify
//         .services(serviceSID)
//         .verifications.create({
//           to: `+91${num}`,
//           channel: "sms"
//         }).then((resp)=>{
//           req.session.number = resp.to
//           res.redirect('/otp')
//         }).catch((err)=>{
//           console.log(err);
//         })   
//       })
//     }
//   }) 
// })


router.post('/signup',(req,res)=>{
  req.session.doSignUp = req.body
  let num = req.body.Phone
  let mobile = `+91${num}`
  userHelpers.getUserDetails(mobile).then((user)=>{
    if (user) {
      req.session.userExist = true
      res.redirect('/signup')
    }else {
      // userHelpers.doSignUp(req.body).then((user)=>{
        client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${num}`,
          channel: "sms"
        }).then((resp)=>{
          req.session.number = resp.to
          res.redirect('/otp')
        }).catch((err)=>{
          console.log(err);
        })   
      // })
    }
  }) 
})

router.get('/otp',(req,res)=>{
  res.render('users/otp')
})

// router.post('/otp',(req,res)=>{
//   let otp = req.body.otp
//   let number = req.session.number
//   client.verify
//   .services(serviceSID)
//   .verificationChecks.create({
//     to: number,
//     code: otp
//   }).then(async(resp)=>{
//     if (resp.valid) {
//       let user = await userHelpers.getUserDetails(number)
//       req.session.userLoggedIn = true
//       req.session.user = user
//       res.redirect('/')
//     }else {
//       redirect('/otp')
//     }
//   })
// })

router.post('/otp',(req,res)=>{
  let otp = req.body.otp
  let number = req.session.number
  client.verify
  .services(serviceSID)
  .verificationChecks.create({
    to: number,
    code: otp
  }).then(async(resp)=>{
    if (resp.valid) {
      let signUpData = req.session.doSignUp
      console.log(signUpData);
      userHelpers.doSignUp(signUpData).then(async() => {
        let user = await userHelpers.getUserDetails(number)
        req.session.userLoggedIn = true
        req.session.user = user
        res.redirect('/')
      })
      
    }else {
      redirect('/otp')
    }
  })
})



// router.post('/signup',(req,res)=>{
//   console.log(req.body);
//   userHelpers.doSignUp(req.body).then((response)=>{
//     req.session.user=response
//     req.session.userLoggedIn = true
//     res.redirect('/')
//   })
// })
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){  
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }else{
      req.session.userLoginErr = "Invalid Number or Password"
      res.redirect('/login')
    }
  })
})

router.get('/verifyMobile',(req,res)=>{
  res.render('users/verifyMobile',{"invalidNumber": req.session.invalidNumber})
  req.session.invalidNumber = false
})
router.post('/verifyMobile',(req,res)=>{
  let num = req.body.mobile
  let number = `+91${num}`
  console.log("num"+ number);
  userHelpers.getUserDetails(number).then((user)=>{
    if (user) {
      req.session.user = user
      client.verify
      .services(serviceSID)
      .verifications.create({
        to: `+91${num}`,
        channel: "sms"
      }).then((resp)=>{
        console.log(resp);
        req.session.number = resp.to
        res.redirect('/verifyOtp')
      }).catch((err)=>{
        console.log(err);
      })
    }else{
      req.session.invalidNumber = true
      res.redirect('/verifyMobile')
    }
  })
})
router.get('/verifyOtp',(req,res)=>{
  res.render('users/verifyOtp',{"invalidOtp": req.session.invalidOtp})
  req.session.invalidOtp = false
})
router.post('/verifyOtp',(req,res)=>{
  let otp = req.body.otp
  let number = req.session.number
  client.verify
  .services(serviceSID)
  .verificationChecks.create({
    to: number,
    code: otp
  }).then(async(resp)=>{
    console.log(resp);
    if (resp.valid) {
      let user = await userHelpers.getUserDetails(number)
      req.session.userLoggedIn = true
      res.redirect('/')
      req.session.user = user
    }else {
      req.session.invalidOtp = true
      res.redirect('/verifyOtp')
    }
  }).catch((err)=>{
    console.log(err);
    req.session.invalidOtp = true
    res.redirect('/verifyOtp')
  })
})
router.get('/logout',(req,res)=>{
  req.session.user = null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/resend-otp',(req,res)=>{
  let number = req.session.number
  console.log(number);
  client.verify
  .services(serviceSID)
  .verifications.create({
    to: `${number}`,
    channel: "sms"
  }).then((response)=>{
    req.session.user = response.user
    req.session.resend = true
    res.redirect('/otp')
  }).catch((err)=>{
    req.session.invalidOtp = true
    res.redirect('/signup')
  })
})
router.get('/resendlogin-otp',(req,res)=>{
  let number = req.session.number
  client.verify
  .services(serviceSID)
  .verifications.create({
    to: `${number}`,
    channel: "sms"
  }).then((response)=>{
    req.session.user = response.user
    req.session.resend = true
    res.redirect('/verifyOtp')
  }).catch((err)=>{
    req.session.invalidOtp = true
    res.redirect('/login')
  })
})
router.post('/resetPswd',(req,res)=>{
  let num = req.body.mobile
  let No = `+91${req.body.mobile}`
  req.session.mobileNumber = No
  userHelpers.getUserDetails(No).then((user)=>{
    if (user) {
      client.verify
      .services(serviceSID)
      .verifications.create({
        to: `+91${num}`,
        channel: "sms"
      }).then((resp)=>{
        console.log(resp);
        req.session.number = resp.to
        res.redirect('/forgotOtp')
      }).catch((err)=>{
        console.log(err);
      })
      // res.redirect('/resetPswd')
    }else {
      // req.session.NoUser = true
      res.redirect('/forgotpswd')
    }
  })
})

router.post('/forgotOtp',(req,res)=>{
  let number = req.session.number
  let otp = req.body.otp
  client.verify
  .services(serviceSID)
  .verificationChecks.create({
    to: number,
    code: otp
  }).then(async(resp)=>{
    console.log(resp);
    if (resp.valid) {
      res.redirect('/resetPswd')
      // let user = await userHelpers.getUserDetails(number)
      // req.session.userLoggedIn = true
      // res.redirect('/')
      // req.session.user = user
    }else {
      // req.session.invalidOtp = true
      res.redirect('/forgotOtp')
    }
  }).catch((err)=>{
    console.log(err);
    // req.session.invalidOtp = true
    res.redirect('/forgotOtp')
  })
})

router.get('/forgotOtp',(req,res)=>{
  res.render('users/forgotOtp')
})

router.get('/forgotpswd',(req,res)=>{
  res.render('users/forgot-mobile')
})
router.get('/resetPswd',(req,res)=>{
  res.render('users/resetPassword')
})
// router.post('/resetPswd',(req,res)=>{
//   let No = `+91${req.body.mobile}`
//   req.session.mobileNumber = No
//   userHelpers.getUserDetails(No).then((user)=>{
//     if (user) {
//       res.redirect('/resetPswd')
//     }else {
//       // req.session.NoUser = true
//       res.redirect('/forgotpswd')
//     }
//   })
// })

router.post('/forgotSubmit',(req,res)=>{
  let number = req.session.mobileNumber
  let firstPassword = req.body.firstPswd
  let confirmPassword = req.body.confirmPswd

  if (firstPassword === confirmPassword) {
    userHelpers.setPassword(number,firstPassword).then((response)=>{
      res.redirect('/login')
    })
  }else {
    res.redirect('/resetPswd')
  }

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
  let total = 0
  if (req.session.Ctotal){
    total = req.session.Ctotal
  }else {
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  var address = null
  let status = await userHelpers.addressChecker(req.session.user._id)
  var address = null
  if (status.address) {
    let addrs = await userHelpers.getUserAddress(req.session.user._id)
    let length = addrs.length
    address = addrs.slice(length -2, length)
    console.log("sdddd"+ address);
    res.render('users/place-order',{user:req.session.user,total,address})
  }
  //  let addrs = userHelpers.getUserAddress(req.session.user._id)
  //   console.log(addrs);
  //  let len = addrs.length
  //    address = addrs.slice(len - 2, len)
  //    res.render('users/place-order',{user:req.session.user,total})

})
router.post('/place-order',async(req,res)=>{
  let couponCode = req.session.Ccode
  let products = await userHelpers.getCartProList(req.body.userId)
  let total = 0
  if (req.session.Ctotal){
    total = req.session.Ctotal
  }else {
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  userHelpers.placeOrder(req.body,products,total,couponCode).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,total).then((response)=>{
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
  let cancel = await userHelpers.statusCancel()
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/orders',{user:req.session.user,orders,cancel})
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

router.get('/user-profile',async(req,res)=>{
  let id = req.session.user._id
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let user = await userHelpers.userProfile(id)
  let status = await userHelpers.addressChecker(id)
  var address = null
  if (status.address) {
    let addrs = await userHelpers.getUserAddress(id)
    let length = addrs.length
    address = addrs.slice(length -2, length)
    console.log("sdddd"+ address);
    res.render('users/user-profile',{user,user:req.session.user,address})
  }else {
    res.render('users/user-profile',{user,user:req.session.user})
  }

})
router.get('/add-new-profile-addrs',(req,res)=>{
  res.render('users/addProfileAddress',{user:req.session.user})
})
router.post('/add-new-profile-addrs',(req,res)=>{
  userHelpers.addNewAddress(req.body).then((response)=>{
    res.redirect('/user-profile')
  })
})
router.get('/edit-U-addrs/:id',async(req,res)=>{
  let addId = req.params.id
  let userId = req.session.user._id
  let address = await userHelpers.singleAddress(userId,addId)
  res.render('users/edit-address',{address,user:req.session.user})
})
router.post('/edit-U-addrs/:id',(req,res)=>{
  let addId = req.params.id
  let userId = req.session.user._id
  userHelpers.updateAddress(addId,userId,req.body).then((response)=>{
    res.redirect('/user-profile')
  }) 
})
router.get('/delete-U-addrs/:id',(req,res)=>{
  let id = req.params.id
  userId = req.session.user._id
  userHelpers.deleteAddress(id,userId).then(() => {
    res.redirect('/user-profile')
  })
})
router.post('/couponSubmit',(req,res)=> {
  let id = req.session.user._id
  req.session.Ccode = req.body.couponCode
  userHelpers.couponValidate(req.body,id).then((response) => {
    req.session.Ctotal = response.total
     if (response.Success) {
       res.json({couponSuccess:true,total:response.total})
     }else if (response.couponUsed) {
       res.json({couponUsed: true})
     }else if (response.couponExpire) {
       res.json({couponExpire: true})
     }else if (response.invalidCoupon) {
       res.json({invalidCoupon: true})
     }
  })
})



module.exports = router;
