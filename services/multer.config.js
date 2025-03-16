import path from 'path'
import multer from 'multer'
import fs from 'fs';

// Ensure /tmp exists
const tmpDir = '/tmp';
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'./tmp');
    },
    filename:function (req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname+ '-' + uniqueSuffix+path.extname(file.originalname.toLowerCase()))
    }
})
const fileFilter = (req,file,cb)=>{
    const allowedTypes = /jpg|jpeg|png|pdf/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    if(isValidExt){
        cb(null,true)
    }
    else{
        cb(new Error('Only image files (JPG,PNG,PDF)'),false)
    }
}
export const upload = multer({
    storage,fileFilter
})