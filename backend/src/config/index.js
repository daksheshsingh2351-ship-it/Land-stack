import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: jwtSecret,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
};

export default config;
