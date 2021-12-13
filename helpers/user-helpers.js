var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')

module.exports = {

    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data)
            })
        })
        
    }
}