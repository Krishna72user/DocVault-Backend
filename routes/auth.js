import express from 'express'
import { User } from '../models/User.js';
import { validationResult,body } from 'express-validator';
import jwt from 'jsonwebtoken'
import { main } from '../services/nodemailer.config.js';
import bcrypt from 'bcryptjs'
import axios from 'axios';
export const auth = express.Router()

// POST SIGNUP localhost:3000/api/auth/signup
auth.post('/signup', [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],async(req,res)=>{
    try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
       return res.status(400).json({errors,success:false})
    }
    else{
        const {username,email,password} = req.body;
        const isExist = await User.findOne({email})
        if(!isExist){
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password,salt);
            const user = new User({username,email,"password":hashed})
            await user.save()
            const token = jwt.sign({'email':user.email},process.env.SECRET)
            return res.json({token,success:true});
        }
        else{
            return res.status(400).json({"error":"A user with the same email already exists.",success:false})
        }
    }
    } catch (error) {
        res.status(500).json({'Error':"Internal server error."})
    }
    }
)

// POST SIGNUP localhost:3000/api/auth/login
auth.post('/login', [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],async(req,res)=>{
    try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
       return res.status(400).json({'error':"Plaese enter valid credentials.",'success':false})
    }
    else{
        const {email,password} = req.body;
        const isExist = await User.findOne({email})
        if(isExist){
            const result = await bcrypt.compare(password,isExist.password)
            if(result){
                const token = jwt.sign({'email':isExist.email},process.env.SECRET)
                return res.json({token,'success':true});
            }
            else{
                return res.status(400).json({'error':"Please enter valid credentials.",'success':false});

            }
        }
        else{
            return res.status(400).json({"error":"Please enter valid credentials.",'success':false})
        }
    }
    } catch (error) {
        res.status(500).json({'error':"Please enter valid credentials."})
    }
    }
)



//POST SEND OTP localhost:3000/api/auth/send
let otp;
auth.post('/send',[
    body("email").isEmail().withMessage("Invalid email format"),
  ],async (req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
           return res.status(400).json({errors,success:false})
        }
        const {email} = req.body;
        const user = await User.findOne({email})
        if(!user){
            otp =Math.floor(Math.random()*1000000);
            const {success,error} =await main(otp,email)
            if(success){
                setTimeout(()=>{
                    otp=null
                },100000)
                return res.json({success})
            }
            else{
                return res.status(400).json({'success':false,error})
            }
        }
        else{
            return res.status(400).json({"error":"A user with the same email already exists.",success:false})
        }
    }
    catch(error){
        res.status(500).json({'Error':"Internal server error.",success:false})
    }
  })

//POST VERIFY OTP localhost:3000/api/auth/verify
auth.post('/verify',async (req,res)=>{
    try {
        const {OTP} = req.body;
        if(OTP===otp){
            return res.json({"success":true})
        }
        else{
            return res.json({"success":false})
        }
    }
    catch(error){
        res.status(500).json({'Error':"Internal server error."})
    }
  })




// GET GETUSER by authtoken localhost:3000/api/auth/getuser
auth.get('/getuser',async(req,res)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const payload = jwt.verify(token,process.env.SECRET)
        const user = await User.findOne({"email":payload.email})
        if(user){
                return res.json({name:user.username,'success':true});
        }
        else{
            return res.status(400).json({"Error":"Please enter valid credentials."})
        }
    }
     catch (error) {
        res.status(500).json({'Error':"Internal server error.",error})
    }
    
   })

// POST login with google localhost:3000/api/auth/google

auth.get('/google',async(req,res)=>{
    try {
        const googleToken = req.headers.authorization.split(" ")[1];
        if(!googleToken){
            return res.status(400).json({'error':"Token required."})
        }
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
            headers:{
                Authorization:`Bearer ${googleToken}`
            }
        });
        const {email,name} = response.data;
        const isExist = await User.findOne({email})
        if(!isExist){
            const user = new User({username:name,email:email})
            await user.save();
        }
        const token = jwt.sign({email},process.env.SECRET)
        res.json({token})
    } catch (error) {
        res.status(500).json({'Error':"Internal server error.",error})
    }
})