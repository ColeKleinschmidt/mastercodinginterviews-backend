import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import historyRouter from './routes/history.js';
import questionsRouter from './routes/questions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mastercodinginterviews';

app.use(cors());
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/history', historyRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Master Coding Interviews API is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
