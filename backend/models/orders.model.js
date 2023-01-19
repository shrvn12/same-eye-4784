const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    productID:String,
    price:String,
    qty:Number,
    useremail:String,
    properties:Object,
    "date&time":String,
    status:String
})

const orderModel = mongoose.model("order",orderSchema);

module.exports = {
    orderModel
}