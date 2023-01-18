const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    title:String,
    image:String,
    category:String,
    price:String,
    tags:Array,
    properties:Object
})

const productModel = mongoose.model("products",productSchema);

module.exports = {
    productModel
}