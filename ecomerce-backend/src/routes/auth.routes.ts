import { Router } from 'express';
import { handleGoogleLogin, handleRegister, handleLogin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/google', handleGoogleLogin);

export default router;
