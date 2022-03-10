var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { response } = require('../app')
const moment = require('moment')
const { log } = require('console')
var instance = new Razorpay({
    key_id: 'rzp_test_r5p0n7ioSfr096',
    key_secret: 'Xn5Z95nZRUwtCubL4SdoAS58',
  });

module.exports = {

    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10)
            let user = {
                name: userData.Name,
                email: userData.Email,
                mobile: `+91${userData.Phone}`,
                password: userData.Password,
                status: true
            }
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{
                resolve(user)  
            })
        }) 
    },
    // doSignUp:(userData)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         userData.Password = await bcrypt.hash(userData.Password,10)
    //         let user = {
    //             name: userData.Name,
    //             email: userData.Email,
    //             mobile: `+91${userData.Phone}`,
    //             password: userData.Password,
    //             status: true
    //         }
    //         db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{
    //             db.get().collection(collection.USER_COLLECTION).findOne({_id : objectId(data.insertedId)}).then((user)=>{
    //                 resolve(user)
    //             })
    //         })
    //     }) 
    // },
    doLogin:(userData)=>{       
        return new Promise(async(resolve,reject)=>{
            let logginStatus = true
            let Umobile=`+91${userData.Mobile}`
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({mobile: Umobile})               
            if(user){
                bcrypt.compare(userData.Password,user.password).then((status)=>{
                    if(status){                       
                    response.user=user
                    response.status=true
                    resolve(response)
                    }else{                    
                        resolve({status:false})
                    }                
                })              
            }else{
                resolve({status:false})
            }
        })
    },
    getUserDetails:(number)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:number})
            resolve(user)
        })
    },
    // addToCart:(proId,userId)=>{
    //     let proObj = {
    //         items:objectId(proId),
    //         quantity:1
    //     }
    //     return new Promise(async(resolve,reject)=>{
    //         let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    //         if (userCart){
    //             let proExist = userCart.products.findIndex(product => product.items==proId)             
    //             if (proExist !=-1) {
    //                 db.get().collection(collection.CART_COLLECTION)
    //                 .updateOne({user:objectId(userId),'products.items':objectId(proId)},
    //                 {
    //                     $inc:{'products.$.quantity':1}
    //                 }
    //                 ).then(()=>{
    //                     resolve()
    //                 })
    //             }else{
    //                 db.get().collection(collection.CART_COLLECTION)
    //                 .updateOne({user:objectId(userId)},
    //                 {
    //                     $push:{products:proObj}
    //                 }
    //                 ).then((response)=>{
    //                     resolve()
    //                 })            
    //             }            
    //         }else{              
    //             let cartObj = {
    //                 user:objectId(userId),
    //                 products:[proObj]
    //             }
    //             db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
    //                 resolve()
    //             })
    //         }
    //     })
    // },
    addToCart:({product:proId,size},userId)=>{
        let proObj = {
            items:objectId(proId),
            size:size,
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (userCart){
                let proExist = userCart.products.findIndex(product => product.items==proId)             
                if (proExist !=-1) {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.items':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $push:{products:proObj}
                    }
                    ).then((response)=>{
                        resolve()
                    })            
                }            
            }else{              
                let cartObj = {
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    addToWhishlist:({product:proId},userId)=>{
        let proObj = {
            items:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userWhishlist = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if (userWhishlist) {
                db.get().collection(collection.WHISHLIST_COLLECTION)
                .updateOne({user:objectId(userId)},
                {
                    $push:{products:proObj}
                }
                ).then((response)=>{
                    resolve()
                })

            }else {
                let whishlistobj = {
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.WHISHLIST_COLLECTION).insertOne(whishlistobj).then((response)=>{
                    resolve()
                })
            }
        })
        
    },
    // getCartProduct:(userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match:{user:objectId(userId)}
    //             },
    //             {
    //                 $unwind:'$products'
    //             },
    //             {
    //                 $project:{
    //                     items:'$products.items',
    //                     quantity:'$products.quantity'
    //                 }
    //             },
    //             {
    //                 $lookup:{
    //                     from:collection.PRODUCT_COLLECTION,
    //                     localField:'items',
    //                     foreignField:'_id',
    //                     as:'product'
    //                 }
    //             },
    //             {
    //                 $project:{
    //                     items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
    //                 }
    //             }                                                  
    //         ]).toArray()
    //         resolve(cartItems)
    //     })
    // },
    
    getCartProduct:(userId)=>{
        console.log("ghgg "+userId);
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.items',
                        quantity:'$products.quantity',
                        size:'$products.size'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'items',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        items:1,quantity:1,size:1,product:{$arrayElemAt:['$product',0]}
                    }
                }                                                  
            ]).toArray()
            console.log(cartItems);
            resolve(cartItems)
        })
    },
    getWhishProduct:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishItem = await db.get().collection(collection.WHISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.items',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'items',
                        foreignField:'_id',
                        as:"product"
                    }
                },
                {
                    $project:{
                        items:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            console.log(wishItem);
            resolve(wishItem)
        })

    },

    getCartCount:(userId)=>{    
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart){
                count = cart.products.length
            }
            resolve(count)
        })
    },
    getWhishlistCount:(userId)=>{    
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if (cart){
                count = cart.products.length
            }
            console.log("count   " + count);
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if (details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{items:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart),'products.items':objectId(details.product)},
            {
                $inc:{'products.$.quantity':count}
            }
            ).then(()=>{
                resolve({status:true})
            })
         }
        })
    },
    removeCartProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{items:objectId(details.product)}}                    
            }
            ).then((response)=>{
                resolve()
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.items',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'items',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.Price']}}
                    }
                }                                                               
            ]).toArray()
            resolve(total[0].total)
        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let dateIso = new Date()
            let date = moment(dateIso).format('MM/DD/YYYY')
            let time = moment(dateIso).format('HH:mm:ss')
            let orderObj={
                deliveryDetails:{
                    fname:order.Fname,
                    lname:order.Lname,
                    house:order.House,
                    town:order.Town,
                    phone:order.Phone,
                    pincode:order.Pin
                    // address:order.address,
                    // mobile:order.mobile,
                    // pincode:order.pincode
                },
                user:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:date,
                time:time
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})            
                resolve(response.insertedId)
            })
        })

    },
    getCartProList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({user:objectId(userId)}).toArray()        
            resolve(orders)
           
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.items',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'items',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }                                                  
            ]).toArray()
            console.log(orderItems);
            resolve(orderItems)
        })
    },
    generateRazorpay:(orderId,total)=>{
        console.log("order:",orderId);
        return new Promise((resolve,reject)=>{
            var option = {
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId,
            };
            instance.orders.create(option,function(err,order){
                if(err){
                    console.log(err);
                }else{
                    console.log("new order:",order);
                    resolve(order)
                }

            })
                

        })
    },
    verifyPayment:(details)=>{
        return new Promise(async(resolve,reject)=>{
           
            const crypto = require('crypto')   
            let hmac = crypto.createHmac('sha256', 'Xn5Z95nZRUwtCubL4SdoAS58');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex') 
            if (hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },
    singleProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            resolve(product)
        })
    },
    userProfile:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    addNewAddress:(details)=>{
        console.log(details);
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(details.userId)})
            details._id = objectId()
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(details.userId)},
                {
                    $push: {
                        address: details
                    }
                }
                ).then(()=>{
                    resolve()
                })
            }else {
                let addr = [details]
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(details.userId)},
                {
                    $set: {
                        address: addr
                    }
                }
                ).then((user)=>{
                    resolve(user)
                })
            }
        })
    },
    addressChecker:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let status = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            if (user.address) {
                status.address = true
            }
            resolve(status)
        })
    },
    getUserAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            let address = user.address
            resolve(address)
        })
    },
    singleAddress:(userId,addId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).aggregate([

                {
                    $match: {
                        _id:objectId(userId)
                    }
                },
                {
                    $unwind:"$address"
                },
                {
                    $match: {
                        'address._id' :objectId(addId)
                    }
                },
                {
                    $project: {
                        address:1,
                        _id:0
                    }
                }
            ]).toArray()
            console.log(user);
            resolve(user)
        })
    },
    updateAddress:(addId,userId,details)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)})
            if (user) {
                db.get().collection(collection.USER_COLLECTION)
                .updateOne({ address: {$elemMatch: {_id: objectId(addId)}}},
                {
                    $set: {
                        "address.$.Fname": details.Fname,
                        "address.$.Lname": details.Lname,
                        "address.$.House": details.House,
                        "address.$.Town": details.Town,
                        "address.$.Phone": details.Phone,
                        "address.$.Pin": details.Pin,
                    }
                }).then((response)=>{
                    resolve(response)
                })
            }
        })
    }
    
}