import { Assessment } from '../models/Assessment.js';

export async function getDashboardStats(req, res, next) {
  try {
    const userFilter = req.user.role === 'user' ? { user: req.user._id } : {};

    // 1. Total assessments
    const totalAssessments = await Assessment.countDocuments(userFilter);

    // 2. Counts by the four exact status labels + in-progress
    const statusCounts = {
      supported: await Assessment.countDocuments({
        ...userFilter,
        status: 'Supported by available evidence',
      }),
      insufficient: await Assessment.countDocuments({
        ...userFilter,
        status: 'Insufficient evidence',
      }),
      inconsistency: await Assessment.countDocuments({
        ...userFilter,
        status: 'Potential inconsistency',
      }),
      needsReview: await Assessment.countDocuments({
        ...userFilter,
        status: 'Needs human review',
      }),
      draftOrInProgress: await Assessment.countDocuments({
        ...userFilter,
        status: { $in: ['Draft', 'Claims Detected', 'Evidence Attached'] },
      }),
    };

    // 3. Pending reviews
    const pendingReviews = await Assessment.countDocuments({
      ...userFilter,
      $or: [
        { 'reviewRequest.requested': true, humanReviewDecision: null },
        { status: 'Needs human review', humanReviewDecision: null },
      ],
    });

    // 4. Recent assessments (up to 8)
    const recentAssessments = await Assessment.find(userFilter)
      .populate('user', 'name')
      .populate('evidenceDocuments', 'originalName fileType')
      .sort({ createdAt: -1 })
      .limit(8);

    return res.json({
      success: true,
      stats: {
        totalAssessments,
        statusCounts,
        pendingReviews,
      },
      recentAssessments,
    });
  } catch (err) {
    next(err);
  }
}
