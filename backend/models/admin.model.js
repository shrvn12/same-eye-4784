const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    name:String,
    address:String,
    email:String,
    password:String,
    favourites:Array,
    orders:Object
})

const adminModel = mongoose.model("admin",adminSchema);

module.exports = {
    adminModel
}