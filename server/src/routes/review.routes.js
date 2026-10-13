import express from 'express';
import { getReviewQueue, submitReviewDecision } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('reviewer', 'admin'));

router.get('/queue', getReviewQueue);
router.post('/:id/decision', submitReviewDecision);

export default router;
