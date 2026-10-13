import { Assessment } from '../models/Assessment.js';
import { HumanReview } from '../models/HumanReview.js';

/**
 * Get pending assessments waiting in the human review queue
 */
export async function getReviewQueue(req, res, next) {
  try {
    const queue = await Assessment.find({
      $or: [
        { 'reviewRequest.requested': true, humanReviewDecision: null },
        { status: 'Needs human review', humanReviewDecision: null },
      ],
    })
      .populate('user', 'name email')
      .populate('evidenceDocuments', 'originalName fileType fileSize')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit reviewer decision and notes
 */
export async function submitReviewDecision(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, notes, requestedAdditionalEvidence } = req.body;

    if (!decision || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Review decision and notes are required.',
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Create HumanReview record (keeps original AI assessment separate)
    const reviewRecord = await HumanReview.create({
      assessmentId: assessment._id,
      reviewerId: req.user._id,
      decision,
      notes,
      requestedAdditionalEvidence: Array.isArray(requestedAdditionalEvidence)
        ? requestedAdditionalEvidence
        : requestedAdditionalEvidence
        ? [requestedAdditionalEvidence]
        : [],
    });

    assessment.humanReviewDecision = reviewRecord._id;
    await assessment.save();

    return res.status(201).json({
      success: true,
      message: 'Human review decision recorded successfully.',
      review: reviewRecord,
    });
  } catch (err) {
    next(err);
  }
}
