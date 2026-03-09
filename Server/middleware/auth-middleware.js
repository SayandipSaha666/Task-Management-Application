const jwt = require('jsonwebtoken')
const user = require('../models/user')

const userAuthVerification = async(req,res,next) => {
    const token = req.cookies.token
    console.log("token",token)
    if(!token){
        return res.status(400).json({
            success: false,
            message: "Invalid token"
        })
    }else{
        try {
            const decode = jwt.verify(token,process.env.SECRET_KEY);
            console.log("decoded", decode);
            const userInfo = await user.findById(decode.id)
            console.log("userInfo",userInfo)
            if(!userInfo){
                return res.status(400).json({
                    success: false,
                    message: "User not authenticated"
                })
            }else{
                return res.status(201).json({
                    success: true,
                    message: "User authenticated",
                    userInfo
                })
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            })
        }
    }
}

module.exports = {userAuthVerification}