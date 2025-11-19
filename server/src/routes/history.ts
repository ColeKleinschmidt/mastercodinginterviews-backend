import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAttemptById, getUserAttempts, getUserSummary } from '../services/questionService.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;

  const attempts = getUserAttempts(req.user.id);
  const totalItems = attempts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const start = (page - 1) * limit;
  const paginatedAttempts = attempts.slice(start, start + limit);

  res.json({
    attempts: paginatedAttempts,
    page,
    limit,
    totalPages,
    totalItems,
  });
});

router.get('/summary', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const summary = getUserSummary(req.user.id);
  res.json(summary);
});

router.get('/:id', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const attempt = getAttemptById(req.params.id, req.user.id);

  if (!attempt) {
    return res.status(404).json({ message: 'Attempt not found' });
  }

  res.json(attempt);
});

export default router;
