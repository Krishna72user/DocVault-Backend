import { Schema } from "mongoose";
import mongoose from "mongoose";
const user =new Schema({
    username:String,
    email:String,
    password:String
})

export const User = mongoose.model('user',user)