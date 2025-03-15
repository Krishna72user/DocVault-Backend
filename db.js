import mongoose from "mongoose";    
export const conn = async ()=>{
    await mongoose.connect(process.env.MONGO_URI)
}
