import express from 'express'
import {upload} from '../services/multer.config.js'
import { fetchId } from '../middleware/fetchId.js'
import { deleteFile } from '../services/cloudinary.config.js'
import { Docs } from '../models/Docs.js'
import main from '../services/cloudinary.config.js'
import fs from 'fs/promises'
export const user = express.Router()

user.post('/upload',upload.single('file'),fetchId,async (req,res)=>{
    try {
        const path = await main(req.file.path) 
        await fs.rm('./upload',{recursive:true,force:true})
        await fs.mkdir('./upload',{recursive:true})
        const doc =  new Docs({user:req.id,title:req.body.title,url: `${path}`})
        await doc.save()
        res.json({'url': `${path}`})
    } catch (error) {
        res.status(500).json({'Error':"Internal server error.",error})
    }
})

user.get('/sendFile',fetchId,async (req,res)=>{
    // try {
        const files = await Docs.find({user:req.id})
        res.json({files})
    // } catch (error) {
    //     res.status(500).json({'Error':"Internal server error.",error})
    // }
})

user.post('/delete',async (req,res)=>{
    try {
        const {url} = req.body
        const url_arr= url.split("/")
        const public_id = url_arr[7].split('?')[0]
        const dlt = await deleteFile(public_id);
        const result =await Docs.deleteOne({url})
        if(result.acknowledged && dlt){
            res.json({success:true})
        }
        else{
            res.status(500).json({success:false,"error":"Internal server error."})
        }

    } catch (error) {
        res.status(500).json({'Error':"Internal server error."})
    }
})