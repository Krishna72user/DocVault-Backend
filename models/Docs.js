import mongoose from "mongoose";
import {User} from './User.js'
import { Schema } from "mongoose";
const docSchema =new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User
    },
    title:String,
    url: String
})
export const Docs = mongoose.model('docs',docSchema);