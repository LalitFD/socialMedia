import bodyParser from "body-parser";
import express, { Router } from "express"
import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./routes/user.router.js";

const app = express();

mongoose.connect(process.env.URL).then((result) => {
    app.use(express.static("public"))
    app.use(bodyParser.json())
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/", router);

    app.listen(3000, () => {
        console.log("server started")
    })
}).catch((err) => {
    console.log(err)
    console.log("connnection  failed")
})
