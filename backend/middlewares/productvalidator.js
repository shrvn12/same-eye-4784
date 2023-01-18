const jwt = require('jsonwebtoken');
const { productModel } = require("../models/products.model");

const productvalidator = async (req,res,next)=>{
    let id = req.params.id;
    if(id.length !== 24){
        res.send({msg:"invalid product id"});
        return;
    }
    const product = await productModel.findById(id);
    if(product){
        const token = req.headers.authorization;
        jwt.verify(token,process.env.key, async (err,decoded)=>{
            if(err){
                console.log(err);
                res.send({msg:"something went wrong"});
            }
            else{
                next();
            }
        })
    }
    else{
        res.send({msg:"product does not exist"});
    }
}

module.exports = {
    productvalidator
}