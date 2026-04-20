const mongoose = require('mongoose')


function connectToDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{

    })
}

module.exports = connectToDB