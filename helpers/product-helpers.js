var db = require('../config/connection')
var collection = require('../config/collection')
const { promiseCallback } = require('express-fileupload/lib/utilities')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
const { ServerDescription } = require('mongodb')
const { serialize } = require('bson')
const { response } = require('../app')
const bcrypt = require('bcrypt')

module.exports = {


    addProduct:(product)=>{
        product.Price = parseInt(product.Price)
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
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set : {
                    Name : proDetails.Name,
                    Category : proDetails.Category,
                    Description : proDetails.Description,
                    Size : proDetails.Size,
                    Price : proDetails.Price
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
    }
    

    


}