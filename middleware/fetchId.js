import jwt from 'jsonwebtoken'
import { User } from '../models/User.js';
export const fetchId=async(req,res,next)=>{
    try {
        const auth = req.headers.authorization;
        const token = auth.split(" ")[1]
        const payload = jwt.verify(token,process.env.SECRET)
        const user = await User.findOne({email:payload.email})
        req.id = user.id
        next()
    } catch (error) {
        res.status(500).json({'Error':"Internal server error."})
    }
}