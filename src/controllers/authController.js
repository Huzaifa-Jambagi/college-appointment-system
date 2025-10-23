const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const dotenv = require("dotenv").config();

const register = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const User = await userModel.findOne({ email });

    if (User) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: `User:${newUser.name} registered successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in Registration:${error.message}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const User = await userModel.findOne({ email });

    if (!User) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, User.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = { id: User._id, role: User.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: User._id,
        name: User.name,
        role: User.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error in Login:${error.message}`,
    });
  }
};

module.exports = { register, login };
