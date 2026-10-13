import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Rule: Normal registration must always create a 'user' role. Do not allow users to promote themselves.
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getCurrentUser(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}
