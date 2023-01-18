const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require("dotenv").config();

const {adminModel} = require("../models/admin.model");
const { authenticator } = require("../middlewares/authenticator");
const { productModel } = require("../models/products.model");
const {loginValidator} = require("../middlewares/loginvalidator");
const { registrationValidator } = require("../middlewares/rgistrationvalidator");
const { notevalidator } = require("../middlewares/productvalidator");

const saltRounds = process.env.saltRounds;
const userRouter = express.Router();

userRouter.get("/",async (req,res)=>{
    const data = await productModel.find();
    res.send(data.toString());
})

userRouter.use("/register",registrationValidator)

userRouter.post("/register",(req,res)=>{
    const data = req.body;
    bcrypt.hash(data.password, +saltRounds, async (err, hash) => {
        if(err){
            res.send({msg:"Something went wrong"});
        }
        else{
            data.password = hash;
            const user = new adminModel(data);
            await user.save();
            res.send({msg:"registration successful as user"});
        }
    });
})

userRouter.use("/login",loginValidator);

userRouter.post("/login",async(req,res)=>{
    const data = req.body;
    const dbdata = await adminModel.find({email:req.body.email});
    const token = jwt.sign(data, process.env.key,{expiresIn:"1h"});
    bcrypt.compare(data.password, dbdata[0].password).then((result) => {
        if(result){
            res.send({
                msg:"login successful as user",
                token
            });
        }
        else{
            res.send({msg:"password do not match"});
        }
    });
})

userRouter.use(authenticator)

userRouter.patch("/addtofav/:id",async (req,res)=>{
    const data = req.body;
    const id = req.params.id;
    if(id.length !== 24){
        res.send({msg:"invalid product id"})
        return;
    }
    const token = req.headers.authorization;
    try {
        let product = await productModel.findById(id);
        if(product === null){
            res.send({mag:"product does not exist"});
            return;
        }
        jwt.verify(token,process.env.key,async (err,decoded)=>{
            if(err){
                console.log(err);
                res.send({msg:"something went wrong"})
            }
            else{
                if(decoded.favourites === undefined){
                    decoded.favourites = [];
                }
                decoded.favourites.push(product.id);
                console.log(decoded.email);
                await adminModel.findOneAndUpdate({email:decoded.email},decoded);
                res.send({msg:"added to favourites"})
            }
        })
    }
    catch (error) {
        console.log(error);
        res.send({msg:"something went wrong"})
    }
})

userRouter.patch("/placeorder/:id",async (req,res)=>{
    const data = req.body;
    const id = req.params.id;
    if(id.length !== 24){
        res.send({msg:"invalid product id"})
        return;
    }
    const token = req.headers.authorization;
    try {
        let product = await productModel.findById(id);
        if(product === null){
            res.send({mag:"product does not exist"});
            return;
        }
        let orderdeatils = {
            price:product.price,
            properties:data,
            "date&time":new Date(),
            status:"order placed"
        }
        jwt.verify(token,process.env.key,async (err,decoded)=>{
            if(err){
                console.log(err);
                res.send({msg:"something went wrong"})
            }
            else{
                if(decoded.orders === undefined){
                    decoded.orders = {};
                }
                decoded.orders[id] = orderdeatils;
                // console.log(decoded);
                await adminModel.findOneAndUpdate({email:decoded.email},decoded);
                res.send({msg:"order placed"})
            }
        })
    }
    catch (error) {
        console.log(error);
        res.send({msg:"something went wrong"})
    }
})

module.exports = {
    userRouter
}