import express from "express";
import { getAllPosts, getPost, createPost } from "../controller/postController.js";

import multer from "multer";
const upload = multer({ dest: "public/post" })


const Prouter = express.Router();

Prouter.get("/getAllPost", auth,getAllPosts);
Prouter.get("/getPost/:id", getPost);
Prouter.post("/createPost", upload.single("media"), createPost)


export { Prouter };