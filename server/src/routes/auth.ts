import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import User, { IUser } from '../models/User.js';

const router = express.Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const toUserResponse = (user: IUser) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  stats: {
    loginCount: user.loginCount,
    lastLoginAt: user.lastLoginAt ?? null,
  },
});

router.post('/signup', async (req, res) => {
  const { email, password, displayName } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash: hashedPassword,
      displayName: displayName?.trim() || normalizedEmail.split('@')[0],
    });

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({ token, user: toUserResponse(user) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    console.error('Error signing up user', error);
    return res.status(500).json({ message: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.loginCount += 1;
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    return res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    console.error('Error logging in user', error);
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const refreshedUser = await User.findById(req.user.id);
    if (!refreshedUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.json({ user: toUserResponse(refreshedUser) });
  } catch (error) {
    console.error('Error fetching user profile', error);
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export default router;
