import mongoose from 'mongoose';

const assessmentVersionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    assessmentResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    trigger: {
      type: String,
      default: 'initial_assessment', // 'initial_assessment', 'evidence_update', 'reassessment'
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const AssessmentVersion = mongoose.model('AssessmentVersion', assessmentVersionSchema);
