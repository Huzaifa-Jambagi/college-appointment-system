const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const userModel=require('../models/userModel');
const dotenv=require('dotenv').config();

const register=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body;

        if(!name || !email || !password || !role){
            return res.status(400).send({success:false, message:'All fields are required'});
        }

        const User=await userModel.findOne({email});

        if(User){
            return res.status(400).send({success:false, message:'User already exists'});
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=await userModel.create({
            name,
            email,
            password:hashedPassword,
            role
        })
        res.status(201).send({success:true, message:`User:${newUser.name} registered successfully`});

    } catch (error) {
         res.status(500).send({success:false, message:`Error in Registration:${error.message}`});      
    }
}

const login=async(req,res)=>{
    try {
            const {email,password}=req.body;
            
            if(!email || !password){
               return res.status(400).send({success:false, message:'All fields are required'});
            }

            const User=await userModel.findOne({email});

            if(!User){
                return res.status(404).send({success:false, message:'User not found'});
            }

            const isPasswordMatched=await bcrypt.compare(password,User.password);

            if(!isPasswordMatched){
                return res.status(400).send({success:false, message:'Invalid credentials'});
            }
           
            const payload={id:User._id, role:User.role};

           const token= jwt.sign(payload,process.env.JWT_SECRET)

           res.status(200).send({success:true, message:'Login successful',token});

    } catch (error) {
      return res.status(500).send({success:false, message:`Error in Login:${error.message}`});   
    }

}