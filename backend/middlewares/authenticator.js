const jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticator = (req,res,next)=>{
    if(req.headers.authorization){
        const token = req.headers.authorization
        jwt.verify(token, process.env.key , function(err, decoded) {
            if(err){
                console.log(err);
                res.send({msg:"you are not authorised, try logging in again"});
            }
            else{
                next();
            }
        });
    }
    else{
        res.send({msg:"you are not logged in"});
    }
}

module.exports = {
    authenticator
}