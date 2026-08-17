import { Router } from 'express';
import { handleGoogleLogin, handleRegister, handleLogin, handleLogout, handleUpdateProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/google', handleGoogleLogin);
router.post('/logout', handleLogout);

router.patch('/profile', authenticateToken as any, handleUpdateProfile as any);

export default router;
