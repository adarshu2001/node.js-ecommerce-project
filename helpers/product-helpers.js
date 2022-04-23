var db = require('../config/connection')
var collection = require('../config/collection')
const { promiseCallback } = require('express-fileupload/lib/utilities')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
const { ServerDescription } = require('mongodb')
const { serialize } = require('bson')
const { response } = require('../app')
const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = {


    addCategory:(data) => {
        return new Promise(async(resolve,reject)=>{
            let cat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category: data.Name})
            if (cat) {
                await db.get().collection(collection.CATEGORY_COLLECTION)
                .updateOne({category: data.Name},
                    {
                        $push: {Scategory: data.Sname}
                    }
                    )
                    resolve()
            }else{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .insertOne({category: data.Name, Scategory: [data.Sname] }).then((response)=>{
                resolve(response)
            })
          }
        })
    },
    categoryDetails: () => {
        return new Promise(async(resolve,reject)=>{
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    



    addBrand:(data) => {
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response)=>{
                resolve(response.insertedId.toString())
            })
        })
    },
    getAllBrand:() =>{
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brand)
        })
    },
    editBrand:(bId) => {
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(bId)}).then((brand)=>{
               resolve(brand)
            })
        })
    },
    updateBrand:(data,Uid) => {
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION)
            .updateOne({_id:objectId(Uid)},
            {
                $set: {
                    Name : data.Name
                }

            }).then((response)=>{
                resolve(response)
            })
        })

    },


    addProduct:(product)=>{
        product.price = parseInt(product.price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ _id: -1 }).toArray().then((products)=>{
                resolve(products)
            })
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getEditProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            proDetails.price = parseInt(proDetails.price)
            proDetails.stock = parseInt(proDetails.stock)
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set : {
                    name: proDetails.name,
                    stock: proDetails.stock,
                    about: proDetails.about,
                    price: proDetails.price,
                    brand: proDetails.brand,
                    Mcategory: proDetails.Mcategory,
                    Scategory: proDetails.Scategory
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    adminDoSignup:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            adminData.Password = await bcrypt.hash(adminData.Password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
                console.log(data);
                resolve(data)
            })
        })
    },
    adminDoLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let logginStatus = false
            let responseAdmin={}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if (admin){
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if (status){
                       responseAdmin.admin=admin 
                       responseAdmin.status=true
                       resolve(responseAdmin)
                       console.log("admin true");
                    }else{
                        resolve({status:false})
                        console.log("admin False");
                    }
                })
            }else{
                resolve({status:false})
            }


        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(allUsers)
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId)},
            {
                $set: {
                    status:false
                }
            }
            ).then((response)=>{
                resolve(response)
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId)},
            {
                $set: {
                    status:true
                }
            }
            ).then((response)=>{
                resolve(response)
            })
        })

    },
    getBlockedUSers: () =>{
        return new Promise(async(resolve,reject)=>{
           let blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({status:false}).toArray()
           resolve(blockedUSers)
        })
    },



    productOffer: (data) => {
        return new Promise(async(resolve,reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: data.name })
            data.percentage = parseInt(data.percentage)
            let actualPrice = product.price
            let newPrice= (((product.price) * (data.percentage)) / 100)
            newPrice = newPrice.toFixed()
            db.get().collection(collection.PRODUCT_OFFER).insertOne(data).then((response) => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({name: data.name},
                    {
                        $set: {
                            proOffer: true,
                            percentage: data.percentage,
                            price: (actualPrice - newPrice),
                            actualPrice: actualPrice
                        }
                    }).then((response)=>{
                        resolve()
                    })

            })
            
        })

    },
    getProductOffer: () => {
        return new Promise(async(resolve,reject) => {
            let poffer = db.get().collection(collection.PRODUCT_OFFER).find().toArray()
            resolve(poffer)
        })
    },
    deleteOffer: (offerId) => {
        return new Promise(async(resolve,reject) => {
            let proOffer = await db.get().collection(collection.PRODUCT_OFFER).findOne({_id: objectId(offerId)})
            let pname = proOffer.name
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({name: pname})
            db.get().collection(collection.PRODUCT_OFFER).deleteOne({_id: objectId(offerId)}).then((response)=> {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({name : pname},
                    {
                        $set: {
                            price: product.actualPrice
                        },
                        $unset: {
                            proOffer: "",
                            percentage: "",
                            actualPrice: ""
                        }
                    }).then(()=> {
                        resolve()
                    })
            })
        })
    },

    addCoupon: (Cdata) => {
        return new Promise((resolve,reject) => {
            let date = Cdata.startDate
            let expire = Cdata.endDate
            let data = {
                coupon: Cdata.couponCode,
                percentage: Cdata.percentage,
                status: 1,
                date: date,
                EndDate: expire,
                users:[]
            }
            db.get().collection(collection.COUPON_OFFER).insertOne(data).then((response) => {
                resolve()
            })
            
        })
    },
    getAllCoupon: () => {
        return new Promise(async(resolve,reject) => {
            let coupon = await db.get().collection(collection.COUPON_OFFER).find().toArray()
            resolve(coupon)
        })
    },
    deleteCoupon: (id) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_OFFER).deleteOne({_id: objectId(id)}).then((response) => {
                resolve(response)
            })
        })

    },

    brandOffer:(data) => {
        console.log(data);
        return new Promise(async(resolve,reject) => {
            let brand = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand: data.name}).toArray()
            console.log(brand);
            let brandLength = brand.length
            let offerValue = data.percentage
           
            for(let i = 0; i < brandLength; i++ ) {
               db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(brand[i]._id)}).then((proData) => {
                let ActualPrice = proData.price
                let discountVal = ((ActualPrice * offerValue) / 100).toFixed()
                let offerPrice = (ActualPrice - discountVal)

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(brand[i]._id)},
                {
                    $set: {
                        proOffer: true,
                        percentage: offerValue,
                        price: offerPrice,
                        actualPrice: ActualPrice
                    }
                }).then(() => {
                   
                    resolve() 
                })

               })

            }
            db.get().collection(collection.BRAND_OFFER).insertOne(data).then(()=> {
                resolve()
            })
        })
    },

    getBrandOffer: () => {
        return new Promise(async(resolve,reject) => {
            let brandOffer = await db.get().collection(collection.BRAND_OFFER).find().toArray()
            resolve(brandOffer)
        })

    },
    deleteBrandOffer: (brandId) => {
        console.log(brandId);
        return new Promise(async(resolve,reject) => {
            let offerBrand = await db.get().collection(collection.BRAND_OFFER).findOne({_id: objectId(brandId)})
            let bName = offerBrand.name
            let brand = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand: bName}).toArray()
            let brandLength = brand.length
           
            for(let i = 0; i < brandLength; i++ ) {
               db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(brand[i]._id)}).then((proData) => {
                let ActualPrice = proData.actualPrice
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(brand[i]._id)},
                {
                    $set: {
                        price: ActualPrice
                    },
                    $unset: {
                        actualPrice: "",
                        percentage: "",
                        proOffer: ""
                    }
                }).then(() => {
                   
                    resolve() 
                })

               })

            }
            db.get().collection(collection.BRAND_OFFER).deleteOne({_id: objectId(brandId)}).then(()=> {
                resolve()
            })
            
        })


    },



    getAllOrders: () => {
        return new Promise(async(resolve,reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(orders)
        })
    },
    changeOrderStatus: (orderId,newStatus) => {
        return new Promise((resolve,reject)=> {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set: {
                    status: newStatus
                }
            }).then(() => {
                resolve()
            })
        })
    },
    allMethods:() => {
        let methods = []
        return new Promise(async(resolve,reject) => {
            let codProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'COD'
                    }
                }
            ]).toArray() 
            let CODlen = codProduct.length
            methods.push(CODlen)



            let RazorPayProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'RazorPay'
                    }
                }
            ]).toArray() 
            let RazorPayLen = RazorPayProduct.length
            methods.push(RazorPayLen)



            let PayPalProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: 'PayPal'
                    }
                }
            ]).toArray() 
            let PayPalLen = PayPalProduct.length
            methods.push(PayPalLen)


            resolve(methods)

        })
    },
    orderStatus:() => {
        let status = []
        return new Promise(async(resolve,reject) => {
            let pending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status:"Pending"
                    }
                }
            ]).toArray()
            let pendingLen = pending.length
            status.push(pendingLen)


            let placed = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status:"Placed"
                    }
                }
            ]).toArray()
            let placedLen = placed.length
            status.push(placedLen)


            let shipped = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status:"Shipped"
                    }
                }
            ]).toArray()
            let shippedLen = shipped.length
            status.push(shippedLen)


            let delivered = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status:"Delivered"
                    }
                }
            ]).toArray()
            let deliveredLen = delivered.length
            status.push(deliveredLen)



            let cancelled = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status:"Cancelled"
                    }
                }
            ]).toArray()
            let cancelledLen = cancelled.length
            status.push(cancelledLen)

            resolve(status)

        })

    },
    userCount:() => {
        return new Promise(async(resolve,reject) => {
            let Ucount = await db.get().collection(collection.USER_COLLECTION).count()
            resolve(Ucount)
        })
    },
    orderCount: () => {
        return new Promise(async(resolve,reject) => {
            let orderCount = await db.get().collection(collection.ORDER_COLLECTION).count()
            resolve(orderCount)
        })
    },
    productCount: () => {
        return new Promise(async(resolve,reject) => {
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).count()
            resolve(productCount)
        })
    },
    totalProfit: () => {
        return new Promise(async(resolve,reject) => {
            let newTotal = 0
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: "Delivered"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }

                    }
                }
            ]).toArray()
            if (total[0]) {
                resolve(total[0].total)
            }else {
                resolve(newTotal)
            }
        })
    }
    



}