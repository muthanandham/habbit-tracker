import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.get('/profile', authenticateToken, authController.getProfile);

router.patch(
  '/profile',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  authController.updateProfile
);

export default router;
