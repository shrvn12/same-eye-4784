const express = require("express");
const { connection } = require("./configs/db");
const { adminRouter } = require("./routes/admin.routes");
const app = express();
const {userRouter} = require("./routes/user.routes")

require("dotenv").config();

app.use(express.json());

app.get("/",(req,res) => {
    res.send({msg:"Welcome from server"});
})
app.use("/sc/admin",adminRouter);
app.use("/sc/user",userRouter)

app.listen(process.env.port,async ()=>{
    try {
        await connection
        console.log("Connected to DB");
    }
    catch (error) {
        console.log("Error while connecting to DB");
        console.log(error);
    }
    console.log(`Server is running at ${process.env.port}`);
})