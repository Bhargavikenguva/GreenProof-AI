import express from 'express';
import { getDashboardStats } from '../controllers/stats.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, getDashboardStats);

export default router;
