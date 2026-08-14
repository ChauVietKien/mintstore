import { Router } from 'express';
import { handleGoogleLogin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', handleGoogleLogin);

export default router;
