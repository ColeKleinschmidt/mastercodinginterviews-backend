import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js';
import env from './config/env.js';
import authRouter from './routes/auth.js';
import historyRouter from './routes/history.js';
import questionsRouter from './routes/questions.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://mastercodinginterviews.com',
  'https://www.mastercodinginterviews.com',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/history', historyRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Master Coding Interviews API is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
