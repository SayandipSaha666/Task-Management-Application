const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { publishUserEvent } = require('../events/publisher');

// ─── Validation Schemas (unchanged from monolith) ──────────────
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// ─── JWT Helper (unchanged from monolith) ──────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: '24h'
  });
};

// ─── Register ──────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const { error } = registerSchema.validate({ name, email, password });

  if (error) {
    return res.status(400).json({
      success: false, message: error.details[0].message
    });
  }

  try {
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({
        success: false, message: 'Email already exists'
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword });
    await newUser.save();

    const token = generateToken(newUser._id);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    // Publish event to RabbitMQ
    await publishUserEvent('user.registered', {
      userId: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userData: {
        name: newUser.name,
        email: newUser.email,
        id: newUser._id
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Login ─────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({
      success: false, message: error.details[0].message
    });
  }

  try {
    const getUser = await User.findOne({ email });
    if (!getUser) {
      return res.status(400).json({
        success: false, message: 'User does not exist'
      });
    }

    const checkAuth = await bcrypt.compare(password, getUser.password);
    if (!checkAuth) {
      return res.status(400).json({
        success: false, message: 'Invalid Credentials'
      });
    }

    const token = generateToken(getUser._id);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    // Publish event to RabbitMQ
    await publishUserEvent('user.loggedIn', {
      userId: getUser._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: 'User logged in successfully',
      userData: {
        name: getUser.name,
        email: getUser.email,
        id: getUser._id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Auth Verification ─────────────────────────────────────────
// here it's controller instead of middleware as it's an endpoint in microservice
const userAuthVerification = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false, message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userInfo = await User.findById(decoded.id).select('-password');

    if (!userInfo) {
      return res.status(401).json({
        success: false, message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User authenticated',
      userInfo
    });

  } catch (error) {
    return res.status(401).json({
      success: false, message: 'Invalid or expired token'
    });
  }
};

// ─── Logout ────────────────────────────────────────────────────
const logoutUser = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax'
  });

  // Publish event to RabbitMQ 
  await publishUserEvent('user.loggedOut', {
    userId: req.headers['x-user-id'] || 'unknown'
  });


  return res.status(200).json({
    success: true, message: 'User logged out successfully'
  });
};

module.exports = { registerUser, loginUser, logoutUser, userAuthVerification };
