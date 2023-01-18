const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require("dotenv").config();

const {adminModel} = require("../models/admin.model");
const { authenticator } = require("../middlewares/authenticator");
const { productModel } = require("../models/products.model");
const {loginValidator} = require("../middlewares/loginvalidator");
const { registrationValidator } = require("../middlewares/rgistrationvalidator");
const { productvalidator } = require("../middlewares/productvalidator");

const saltRounds = process.env.saltRounds;
const adminRouter = express.Router();

adminRouter.use("/register",registrationValidator)

adminRouter.post("/register",(req,res)=>{
    const data = req.body;
    data.role = "admin";
    bcrypt.hash(data.password, +saltRounds, async (err, hash) => {
        if(err){
            res.send({msg:"Something went wrong"});
        }
        else{
            data.password = hash;
            const user = new adminModel(data);
            await user.save();
            res.send({msg:"registration successful as admin"});
        }
    });
})

adminRouter.use("/login",loginValidator);

adminRouter.post("/login",async(req,res)=>{
    const data = req.body;
    const dbdata = await adminModel.find({email:data.email});
    const token = jwt.sign(data, process.env.key,{expiresIn:"24h"});
    bcrypt.compare(data.password, dbdata[0].password).then((result) => {
        if(result){
            res.send({
                msg:"login successful as admin",
                token
            });
        }
        else{
            res.send({msg:"password do not match"});
        }
    });
})

adminRouter.use(authenticator)

adminRouter.get("/products",async (req,res)=>{
    const data = await productModel.find();
    res.send(data);
})

adminRouter.post("/add",async (req,res)=>{
    const data = req.body;
    if(data.title && data.image && data.price && data.category){
        const token = req.headers.authorization;
        jwt.verify(token,process.env.key,async (err,decoded)=>{
            if(err){
                console.log(err);
                res.send({msg:"something went wrong"})
            }
            else{
                let product = productModel(data);
                await product.save();
                res.send({msg:"product added"});
            }
        })
    }
    else{
        res.send({msg:"please provide title, image, price and category"})
    }
})

adminRouter.use("/update/:id",productvalidator)

adminRouter.patch("/update/:id",async (req,res)=>{
    let id = req.params.id;
    const update = req.body;
    try {
        await productModel.findByIdAndUpdate(id,update);
        res.send({msg:"updation sucessful"});
    }
    catch (error) {
        console.log(error);
        res.send({msg:"something went wrong"})
    }
})

adminRouter.use("/delete/:id",productvalidator)

adminRouter.delete("/delete/:id",async (req,res)=>{
    let id = req.params.id;
    try {
        await productModel.findByIdAndDelete(id);
        res.send({msg:"deletion sucessful"});
    }
    catch (error) {
        console.log(error);
        res.send({msg:"something went wrong"})
    }
})

module.exports = {
    adminRouter
}