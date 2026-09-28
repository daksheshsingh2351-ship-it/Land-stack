import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// ── Security & CORS ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// ── Request parsing ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Development logging ───────────────────────────────────────────
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// ── API routes ────────────────────────────────────────────────────
app.use('/api', routes);
app.use('/.netlify/functions/api', routes);

// ── Error handling (must be last) ─────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
