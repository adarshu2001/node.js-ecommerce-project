var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
const { response } = require('../app')

module.exports = {

    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                db.get().collection(collection.USER_COLLECTION).findOne({_id : objectId(data.insertedId)}).then((user)=>{
                    resolve(user)
                })
            })
        })
        
    },
    doLogin:(userData)=>{            
        return new Promise(async(resolve,reject)=>{
            let logginStatus = false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})               
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
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
    addToCart:(proId,userId)=>{
        let proObj = {
            items:objectId(proId),
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
    getCartProduct:(userId)=>{
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
            resolve(cartItems)
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
            let orderObj={
                deliveryDetails:{
                    address:order.address,
                    mobile:order.mobile,
                    pincode:order.pincode
                },
                user:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})

            })
        })

    },
    getCartProList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    }

}