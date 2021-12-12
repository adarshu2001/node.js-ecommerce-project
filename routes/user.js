var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('users/view-products',{products, admin:false})
  })
});

module.exports = router;
