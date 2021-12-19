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
                    .updateOne({'products.items':objectId(proId)},
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
    }
}