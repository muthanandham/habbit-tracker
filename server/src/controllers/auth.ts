import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRegisterSchema, userLoginSchema } from 'shared';
import { User } from '../models/User.js';
import { Logger } from '../utils/logger.js';
import { ZodError } from 'zod';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = userRegisterSchema.parse(req.body);
    
    const existingUser = await User.findOne({ 
      $or: [{ email: validated.email }, { username: validated.username }] 
    });
    
    if (existingUser) {
      res.status(400).json({ error: 'Email or username already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    
    const newUser = new User({
      email: validated.email,
      username: validated.username,
      password: hashedPassword,
      firstName: validated.firstName,
      lastName: validated.lastName,
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString(), newUser.email);

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    Logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = userLoginSchema.parse(req.body);

    const user = await User.findOne({ 
      $or: [{ email: validated.email }, { username: validated.email }] 
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(validated.password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    Logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { firstName, lastName } = req.body;
    
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
