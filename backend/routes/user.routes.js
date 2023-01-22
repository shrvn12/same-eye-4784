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
const { orderModel } = require("../models/orders.model");

const saltRounds = process.env.saltRounds;
const userRouter = express.Router();

userRouter.get("/",async (req,res)=>{
    const qry = req.query;
    // res.send(qry);
    if(qry.search){
        const data = await productModel.find({$text:{$search:qry.search}});
        res.send(data);
    }
    else{
        const data = await productModel.find();
        res.send(data);
    }
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
userRouter.use("/addtofav/:id",productvalidator);

userRouter.patch("/addtofav/:id",async (req,res)=>{
    const data = req.body;
    const id = req.params.id;
    const token = req.headers.authorization;
        let product = await productModel.findById(id);
        jwt.verify(token,process.env.key,async (err,decoded)=>{
            if(err){
                console.log(err);
                res.send({msg:"something went wrong"})
            }
            else{
                let data = await adminModel.findOne({email:decoded.email});
                if(data.favourites === undefined){
                    data.favourites = [];
                }
                let fav = data.favourites;
                if(fav.includes(id)){
                    res.send({msg:"product already added to favourites"})
                    return;
                }
                data.favourites.push(product.id);
                await adminModel.findOneAndUpdate({email:decoded.email},{favourites:data.favourites});
                res.send({msg:"added to favourites"})
            }
        })
})

userRouter.patch("/placeorder/:id/:qty",async (req,res)=>{
    const data = req.body;
    const id = req.params.id;
    const qty = req.params.qty;
    const token = req.headers.authorization;
        let product = await productModel.findById(id);
        if(product === null){
            res.send({msg:"product does not exist"});
            return;
        }
        let orderdeatils = {
            price:product.price,
            properties:data,
            qty,
            "date&time":new Date(),
            status:"order placed"
        }
        let order = {
            productID:id,
            price:product.price,
            qty,
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
                let data = await adminModel.findOne({email:decoded.email});
                if(data.orders === undefined){
                    data.orders = {};
                }
                if(data.orders[id]){
                    res.send({msg:"order already placed"});
                    return;
                }
                data.orders[id] = orderdeatils;
                order.useremail = decoded.email;
                let neworder = new orderModel(order);
                await neworder.save();
                const useroder = await orderModel.findOne({
                    useremail:decoded.email,
                    productID:id
                })
                await adminModel.findOneAndUpdate({email:decoded.email},{orders:data.orders});
                res.send({msg:"order placed",orderID:useroder.id})
            }
        })
})

userRouter.patch("/cancelorder/:id",async (req,res)=>{
    let id = req.params.id;
    const order = await orderModel.findOne({id});
    let product = order.productID;
    let email = order.useremail;
    let user = await adminModel.findOne({email});
    user.orders[product].status = `order cancelled at ${new Date()}`;
    await adminModel.findByIdAndUpdate(user.id,{orders:user.orders});
    await orderModel.findByIdAndUpdate(id,{status:`order cancelled at ${new Date()}`});
    res.send({msg:"order cancelled successfully"});
})

module.exports = {
    userRouter
}