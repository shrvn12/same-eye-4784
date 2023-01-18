const { adminModel } = require("../models/admin.model");

const loginValidator = async (req,res,next)=>{
    const data = req.body;
    if(data.email === undefined || data.password === undefined){
        res.send({msg:"please provide email and password"});
        return;
    }
    else if(data.email.split("").includes("@") === false){
        res.send({msg:"please enter valid email"})
        return;
    }
    else if(data.password.length < 5){
        res.send({msg:"password should be of minimum 5 characters"})
        return;
    }
    const dbdata = await adminModel.find({email:req.body.email});
    if(dbdata.length === 0){
        res.send({msg:"Account does not exist"});
        return;
    }
    else{
        next()
    }
}
module.exports = {
    loginValidator
}