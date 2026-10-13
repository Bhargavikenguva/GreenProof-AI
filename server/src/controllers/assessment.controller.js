import fs from 'fs';
import path from 'path';
import { Assessment } from '../models/Assessment.js';
import { EvidenceDocument } from '../models/EvidenceDocument.js';
import { AssessmentVersion } from '../models/AssessmentVersion.js';
import { detectClaimsFromImage, assessClaimWithEvidence } from '../services/gemini.service.js';
import { extractDocumentText } from '../services/extraction.service.js';

/**
 * Step 1 & 2: Upload product photo and detect claims using Gemini
 */
export async function analyzeImage(req, res, next) {
  try {
    const { companyName, productName, productDescription } = req.body;

    if (!companyName || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Company name and product name are required.',
      });
    }

    let imageBuffer = null;
    let mimeType = null;
    let imageMetadata = null;

    if (req.file) {
      imageBuffer = fs.readFileSync(req.file.path);
      mimeType = req.file.mimetype;
      imageMetadata = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: `/uploads/images/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'A product photograph (JPG, PNG, or WebP) is required.',
      });
    }

    // Call Gemini Vision to detect claims
    const detectionResult = await detectClaimsFromImage({
      imageBuffer,
      mimeType,
      companyName,
      productName,
      userDescription: productDescription,
    });

    // Create new Assessment record
    const assessment = await Assessment.create({
      user: req.user._id,
      companyName,
      productName,
      productDescription: productDescription || '',
      productImage: imageMetadata,
      imageAnalysis: {
        productDescription: detectionResult.productDescription,
        detectedClaims: detectionResult.detectedClaims || [],
        imageObservations: detectionResult.imageObservations || '',
        ocrUncertainty: detectionResult.ocrUncertainty || null,
        hasVisibleEnvironmentalClaims: Boolean(detectionResult.hasVisibleEnvironmentalClaims),
      },
      status: 'Claims Detected',
    });

    return res.status(201).json({
      success: true,
      message: 'Product image analyzed successfully.',
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create or initialize an assessment manually (or without photo)
 */
export async function createAssessment(req, res, next) {
  try {
    const { companyName, productName, productDescription, manualClaim } = req.body;

    if (!companyName || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Company name and product name are required.',
      });
    }

    const assessment = await Assessment.create({
      user: req.user._id,
      companyName,
      productName,
      productDescription: productDescription || '',
      selectedClaim: manualClaim
        ? {
            id: 'manual_' + Date.now(),
            claimText: manualClaim,
            isManual: true,
            originalOcrText: null,
          }
        : null,
      status: manualClaim ? 'Claims Detected' : 'Draft',
    });

    return res.status(201).json({
      success: true,
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 3: Select or edit claim to investigate
 */
export async function selectClaim(req, res, next) {
  try {
    const { id } = req.params;
    const { claimId, claimText, isManual, originalOcrText } = req.body;

    if (!claimText || !claimText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid environmental claim text is required.',
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Ownership check
    if (assessment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    assessment.selectedClaim = {
      id: claimId || `claim_${Date.now()}`,
      claimText: claimText.trim(),
      isManual: Boolean(isManual),
      originalOcrText: originalOcrText || null,
    };

    if (assessment.status === 'Draft') {
      assessment.status = 'Claims Detected';
    }

    await assessment.save();

    return res.json({
      success: true,
      message: 'Claim selected successfully.',
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all assessments for current user (or all if reviewer/admin)
 */
export async function getAssessments(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const assessments = await Assessment.find(filter)
      .populate('user', 'name email')
      .populate('evidenceDocuments', 'originalName fileType extractionStatus pageCount')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: assessments.length,
      assessments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single assessment by ID with ownership check
 */
export async function getAssessmentById(req, res, next) {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id)
      .populate('user', 'name email')
      .populate('evidenceDocuments')
      .populate({
        path: 'humanReviewDecision',
        populate: { path: 'reviewerId', select: 'name email' },
      });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Authorization: owner, reviewer, or admin
    if (
      assessment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'reviewer' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this assessment.',
      });
    }

    return res.json({
      success: true,
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 4: Upload supporting evidence documents (PDF, DOCX, TXT)
 */
export async function uploadEvidence(req, res, next) {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No evidence documents were uploaded. Please attach at least one PDF, DOCX, or TXT file.',
      });
    }

    const createdEvidence = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const fileType = ['pdf', 'docx', 'txt'].includes(ext) ? ext : 'txt';

      // Extract text using backend extraction service
      const extractionResult = await extractDocumentText(file.path, file.originalname, fileType);

      const doc = await EvidenceDocument.create({
        assessmentId: assessment._id,
        uploadedBy: req.user._id,
        originalName: file.originalname,
        filename: file.filename,
        fileType,
        fileSize: file.size,
        storagePath: `/uploads/evidence/${file.filename}`,
        extractionStatus: extractionResult.extractionStatus,
        extractedText: extractionResult.extractedText,
        pageCount: extractionResult.pageCount,
        passages: extractionResult.passages,
        errorMessage: extractionResult.errorMessage,
      });

      createdEvidence.push(doc);
      assessment.evidenceDocuments.push(doc._id);
    }

    assessment.status = 'Evidence Attached';
    await assessment.save();

    return res.status(201).json({
      success: true,
      message: `${createdEvidence.length} document(s) uploaded and extracted successfully.`,
      evidenceDocuments: createdEvidence,
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 5 & 6: Run Evidence-Based AI Assessment
 */
export async function runAssessmentAnalysis(req, res, next) {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id).populate('evidenceDocuments');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!assessment.selectedClaim || !assessment.selectedClaim.claimText) {
      return res.status(400).json({
        success: false,
        message: 'Please select or specify an environmental claim before running assessment.',
      });
    }

    // Call Gemini Assessment Service
    const assessmentResult = await assessClaimWithEvidence({
      companyName: assessment.companyName,
      productName: assessment.productName,
      productDescription: assessment.productDescription,
      selectedClaim: assessment.selectedClaim,
      evidenceDocuments: assessment.evidenceDocuments || [],
    });

    assessmentResult.assessedAt = new Date();

    // Update Assessment record
    assessment.status = assessmentResult.status;
    assessment.assessmentResult = assessmentResult;
    await assessment.save();

    // Record Version in AssessmentVersion
    const versionCount = await AssessmentVersion.countDocuments({ assessmentId: assessment._id });
    await AssessmentVersion.create({
      assessmentId: assessment._id,
      versionNumber: versionCount + 1,
      assessmentResult,
      trigger: versionCount === 0 ? 'initial_assessment' : 'reassessment',
    });

    return res.json({
      success: true,
      message: 'Assessment completed successfully.',
      assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get version history of an assessment
 */
export async function getAssessmentVersions(req, res, next) {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (
      assessment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'reviewer' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const versions = await AssessmentVersion.find({ assessmentId: id }).sort({ versionNumber: -1 });

    return res.json({
      success: true,
      versions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Request human review
 */
export async function requestHumanReview(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    assessment.reviewRequest = {
      requested: true,
      requestedAt: new Date(),
      reason: reason || 'User requested specialist human review',
    };

    await assessment.save();

    return res.json({
      success: true,
      message: 'Human review requested. The assessment has been queued for specialist review.',
      assessment,
    });
  } catch (err) {
    next(err);
  }
}
