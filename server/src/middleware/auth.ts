import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = { id: userId };
  next();
};
