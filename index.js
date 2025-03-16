import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { conn } from './db.js'
import {auth} from './routes/auth.js'
import {user} from './routes/user.js'

dotenv.config()
const app = express()
app.use('/upload',express.static('upload'))
conn()
app.use(cors(
    {
        origin:'https://doc-vault-client.vercel.app',
        methods:['GET','POST','DELETE','PUT','PATCH'],
        credentials:true
    }
))

app.use(express.json())
app.use('/api/auth',auth)
app.use('/api/user',user)
app.get('/',(req,res)=>{
    res.send('Hello i am a server')
})

app.listen(3000,(req,res)=>{
    console.log("http://localhost:3000")
})

export default app;