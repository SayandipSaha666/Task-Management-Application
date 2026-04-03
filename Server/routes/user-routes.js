const express = require('express')
const userRouter = express.Router();

const {registerUser, loginUser, logoutUser} = require('../controllers/user-controller')
const {userAuthVerification} = require('../middleware/auth-middleware')

userRouter.post('/register',registerUser); // actual path : '/api/user/register'
userRouter.post('/login', loginUser); // actual path: '/api/user/login'
userRouter.post('/auth',userAuthVerification) // actual path: '/api/user/auth'
userRouter.post('/logout',logoutUser) // actual path: '/api/user/logout'

module.exports = userRouter;