const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    title:String,
    image:String,
    category:String,
    price:String,
    color:String,
    gender:String,
    brand:String,
    discount:String
})

const productModel = mongoose.model("products",productSchema);

module.exports = {
    productModel
}