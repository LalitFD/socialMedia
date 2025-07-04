// import User from "./models/User.js";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"

export const register = async (request, response, next) => {
    try {
        let { name, email, password, username } = request.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return response.status(400).json({
                message: "User with this email or username already exists"
            });
        }

        let saltKey = bcrypt.genSaltSync(12);
        password = bcrypt.hashSync(password, saltKey);

        await sendEmail(name, email);

        let newUser = await User.create({
            name,
            email,
            password,
            username
        });
        return response.status(201).json({ message: "user created", user: newUser });
    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: "Internal server error" });
    }
};


export const login = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return response.status(400).json({ message: "Invalid credentials" });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return response.status(400).json({ message: "Invalid credentials" });
        }

        else {
            user.password = undefined;  // { "password":undefined }
            response.cookie("token", generateToken(user._id, user.email))
            return response.status(200).json({ message: "Login success", user })
        }

    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: "Internal server error" });
    }
};


export const logOut = async (request, response, next) => {
    try {
        await response.clearCookie("token");
        return response.status(200).json({ message: "logout success" })
    } catch (err) {
        console.log(err)
        return response.status(500).json({ error: "Internal server error " })
    }
}


import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    const payload = {
        _id: user._id,
        email: user.email,
        name: user.name,               // ✅ Optional but useful
        username: user.username        // ✅ Optional if you have it
    };

    const token = jwt.sign(payload, process.env.secure_key, { expiresIn: "1h" }); // "1hr" → ❌ not valid
    console.log("Generated Token:", token);

    return token;
};



export const sendEmail = (name, email) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mail_id,  // lalitdoriya7gmmail.com
            pass: process.env.mail_password   // 
        }
    });

    console.log(email);

    let mailOptions = {
        from: process.env.mail_id,
        to: email,
        subject: 'Verified Your Account 😊 ',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #333;">Hello, ${name}</h2>
  <p style="font-size: 16px; color: #555;">
    Thank you for registering with us! Please click the button below to verify your account:
  </p>

  <form method="post" action="http://localhost:3000/verification" style="text-align: center; margin-top: 20px;">
    <input type="hidden" name="email" value="${email}" />
    <button type="submit" style="padding: 12px 24px; background-color: #007bff; color: #fff; font-size: 16px; border: none; border-radius: 6px; cursor: pointer;">
      Verify Your Account
    </button>
  </form>

  <p style="font-size: 14px; color: #777; margin-top: 30px;">
    If you did not register for this account, you can ignore this email.
  </p>

  <p style="font-size: 14px; color: #333;">
    Best regards,<br />
    <strong>E-commerce Creator</strong>
  </p>
</div>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export const userVerified = async (request, response, next) => {
    try {
        let { email } = request.body; // doriyalalit8@gmail.com/ 
        email = email.trim().replace(/\/$/, '');

        console.log("Email received:", email);

        let v = await User.updateOne({ email }, { $set: { isVerified: true } });
        return response.status(200).json({ message: "User verified success", v });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};

export const userProfile = async (request, response, next) => {
    try {
        let id = request.user.userId;
        if (!id) return response.status(401).json({ message: "User Not Logged in!" });
        let userProfile = await User.findOne({ where: { id }, raw: true });
        if (!userProfile) return response.status(401).json({ message: "User Not Found!" });

        return response.status(200).json({ message: "Profile Found!", userProfile });
    }
    catch (err) {
        console.log("Error in Finding User Profile ", err);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}