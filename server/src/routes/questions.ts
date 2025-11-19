import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { generateQuestionInstance, submitAttempt } from '../services/questionService.js';

const router = Router();

router.post('/next', authMiddleware, (req, res) => {
  const { type, difficulty, language } = req.body ?? {};

  if (!type) {
    return res.status(400).json({ message: 'Question type is required.' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const result = generateQuestionInstance({ type, difficulty, language }, req.user.id);

  res.json(result);
});

router.post('/submit', authMiddleware, (req, res) => {
  const { questionInstanceId, userAnswer, timeTakenSeconds } = req.body ?? {};

  if (!questionInstanceId || typeof userAnswer !== 'string') {
    return res.status(400).json({ message: 'questionInstanceId and userAnswer are required.' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const attempt = submitAttempt(req.user.id, { questionInstanceId, userAnswer, timeTakenSeconds });

  if (!attempt) {
    return res.status(404).json({ message: 'Question instance not found.' });
  }

  res.json({
    correct: attempt.correct,
    correctAnswer: attempt.correctAnswer,
    explanation: attempt.explanation,
  });
});

export default router;
