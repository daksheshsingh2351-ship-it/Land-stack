import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/database.js';

// ─── Helpers ──────────────────────────────────────────────────────

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

/** Fields to return for user objects (never includes password). */
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ─── Validation helpers ───────────────────────────────────────────

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateRegistration = (body) => {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!body.email || !validateEmail(body.email)) errors.push('A valid email is required.');
  if (!body.password || body.password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
};

const validateLogin = (body) => {
  const errors = [];
  if (!body.email || !validateEmail(body.email)) errors.push('A valid email is required.');
  if (!body.password) errors.push('Password is required.');
  return errors;
};

// ─── Controllers ──────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Create a new user account.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate input
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user (Force CITIZEN role for public registration)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'CITIZEN',
        phone: phone || null,
      },
      select: userSelect,
    });

    // Generate JWT
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate and return a JWT.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // Find user by email (include password for comparison)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: safeUser, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 * Requires: authenticate middleware.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
