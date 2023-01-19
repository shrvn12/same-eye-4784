const registrationValidator = (req,res,next)=>{
    const data = req.body;
    if(data.name === undefined || data.email === undefined || data.password === undefined || data.address === undefined){
        res.send({msg:"please provide name, address, email and password"});
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
    else{
        next();
    }
}
module.exports = {
    registrationValidator
}