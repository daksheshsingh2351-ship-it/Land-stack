import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/database.js';

/**
 * Authentication middleware.
 * Bypasses JWT verification and uses a mock user based on the x-mock-role header
 * to allow direct access to portals without login.
 */
export const authenticate = async (req, res, next) => {
  try {
    const role = req.headers['x-mock-role'] || 'CITIZEN';
    
    // Fetch a user from database that matches the requested role
    let user = await prisma.user.findFirst({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Fallback if no matching user exists in the database
      user = { 
        id: 'mock-id-fallback', 
        email: 'mock@example.com', 
        name: 'Mock User', 
        role, 
        phone: '0000000000', 
        isActive: true, 
        createdAt: new Date() 
      };
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware.
 * Use after authenticate middleware.
 *
 * Usage: authorize('OFFICER', 'ADMIN')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};
