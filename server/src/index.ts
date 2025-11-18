import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'https://mastercodinginterviews.com',
      'https://www.mastercodinginterviews.com',
    ],
  }),
);
app.use(express.json());
app.use('/api/auth', authRouter);

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
