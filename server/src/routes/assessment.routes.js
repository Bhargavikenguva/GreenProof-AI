import express from 'express';
import {
  analyzeImage,
  createAssessment,
  selectClaim,
  getAssessments,
  getAssessmentById,
  uploadEvidence,
  runAssessmentAnalysis,
  getAssessmentVersions,
  requestHumanReview,
} from '../controllers/assessment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadImage, uploadEvidence as uploadEvidenceMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

// Image analysis & claim detection
router.post('/analyze-image', uploadImage.single('image'), analyzeImage);

// Create manual assessment
router.post('/', createAssessment);

// Select or edit claim
router.patch('/:id/select-claim', selectClaim);

// List assessments
router.get('/', getAssessments);

// Get single assessment
router.get('/:id', getAssessmentById);

// Upload evidence documents
router.post('/:id/evidence', uploadEvidenceMiddleware.array('evidence', 5), uploadEvidence);

// Run assessment analysis
router.post('/:id/analyze', runAssessmentAnalysis);

// Version history
router.get('/:id/versions', getAssessmentVersions);

// Request human review
router.post('/:id/review-request', requestHumanReview);

export default router;
