var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId

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
        console.log(userData);     
        return new Promise(async(resolve,reject)=>{
            let logginStatus = false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email}) 
            console.log(user);      
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
    }
}