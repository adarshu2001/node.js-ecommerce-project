var db = require('../config/connection')
var collection = require('../config/collection')
const { promiseCallback } = require('express-fileupload/lib/utilities')
const async = require('hbs/lib/async')

module.exports = {


    addProduct:(product)=>{
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
    }
    


}