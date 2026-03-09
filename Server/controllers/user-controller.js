const Joi = require('joi')
const user = require('../models/user') // mongoose model 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// To register a new user
const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
})
 
const generateToken = (id) => {
    return jwt.sign({id},process.env.SECRET_KEY,{
        expiresIn: 24*60*60
    })
}

const registerUser = async( req,res,next) => {
    const {name,email,password} = req.body
    // validation of input according to the registerSchema
    const {error} = registerSchema.validate({name,email,password})
    console.log(error)
    if(error){
        return res.status(400).json({
            success: false,message: error.details[0].message
        })
    }

    try {
        const isEmailExist = await user.findOne({email})
        if(isEmailExist){
            return res.status(400).json({
                success: false,message: "Email already exists"
            })
        }else{
            const hashPassword = await bcrypt.hash(password,10)
            const newUser = new user({name: name,email: email,password: hashPassword});
            if(newUser){
                await newUser.save();
                const token = generateToken(newUser._id) // _id from mongodb
                res.cookie('token',token,{
                    httpOnly: true,
                    sameSite: 'lax'
                })
                res.status(201).json({
                    success: true,message: "User registered successfully",
                    userData: {
                        name: newUser.name,
                        email: newUser.email,
                        id: newUser._id
                    }
                })
                next()
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,message: "Internal Server Error"
        })
    }
}

const loginUser = async(req,res,next) => {
    const {email,password} = req.body
    const {error} = loginSchema.validate({email,password})
    if(error){
        return res.status(400).json({
            success: false,message: error.details[0].message
        })
    }
    try {
        const getUser = await user.findOne({email})
        if(!getUser){
            return res.status(400).json({
                success: false,message: 'User does not exist'
            })
        }
        const checkAuth = await bcrypt.compare(password,getUser.password)
        if(!checkAuth){
            return res.status(400).json({
                success: false, message: 'Invalid Credentials'
            })
        }
        const token = generateToken(getUser?._id)
        res.cookie('token',token,{
            httpOnly: true,
            sameSite: 'lax'
        })
        res.status(201).json({
            success: true,message: "User logged in successfully",
            userData: {
                name: getUser.name,
                email: getUser.email,
                id: getUser._id
            }
        })
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false, message: "Internal Server Error"
        })
    }
}

const logoutUser = async(req,res,next) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax'
    })

    return res.status(200).json({
        success: true,message: "User logged out successfully"
    })
}

module.exports = {registerUser, loginUser, logoutUser}