import mongoose from 'mongoose';

const humanReviewSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['Approved', 'Rejected', 'Clarification Requested', 'Needs Specialist Testing'],
      required: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    requestedAdditionalEvidence: [
      {
        type: String,
        trim: true,
      },
    ],
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const HumanReview = mongoose.model('HumanReview', humanReviewSchema);
