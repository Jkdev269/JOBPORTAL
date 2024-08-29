require('dotenv').config();
const express= require('express');
const app=express()
const session=require('express-session')
const mongoose=require('mongoose')
const userRoutes = require('./routes/users');
const bodyParser = require('body-parser')

const MongoStore = require('connect-mongo');
app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => console.error('Error connecting to MongoDB:', err));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false } 
}))
app.use('/', userRoutes);
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'));
app.set('view engine','ejs')
app.listen(10000,'0.0.0.0',()=>{
    console.log('sever is starting jk');
})