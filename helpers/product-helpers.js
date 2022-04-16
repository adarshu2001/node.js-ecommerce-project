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
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((products)=>{
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
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
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
    getAllOrders: () => {
        return new Promise(async(resolve,reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
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
    }
    




}