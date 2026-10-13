import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productDescription: {
      type: String,
      default: '',
      trim: true,
    },
    productImage: {
      originalName: { type: String, default: null },
      filename: { type: String, default: null },
      path: { type: String, default: null },
      mimetype: { type: String, default: null },
      size: { type: Number, default: 0 },
    },
    imageAnalysis: {
      productDescription: { type: String, default: '' },
      detectedClaims: [
        {
          id: { type: String, required: true },
          claimText: { type: String, required: true },
          confidence: { type: Number, default: 0.9 },
          exactVisibleText: { type: String, default: '' },
          locationOnPackage: { type: String, default: '' },
          recommendedEvidence: [{ type: String }],
        },
      ],
      imageObservations: { type: String, default: '' },
      ocrUncertainty: { type: String, default: null },
      hasVisibleEnvironmentalClaims: { type: Boolean, default: false },
      rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    selectedClaim: {
      id: { type: String, default: null },
      claimText: { type: String, default: null },
      isManual: { type: Boolean, default: false },
      originalOcrText: { type: String, default: null },
    },
    evidenceDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EvidenceDocument',
      },
    ],
    status: {
      type: String,
      enum: [
        'Draft',
        'Claims Detected',
        'Evidence Attached',
        'Supported by available evidence',
        'Insufficient evidence',
        'Potential inconsistency',
        'Needs human review',
      ],
      default: 'Draft',
      index: true,
    },
    assessmentResult: {
      status: {
        type: String,
        enum: [
          'Supported by available evidence',
          'Insufficient evidence',
          'Potential inconsistency',
          'Needs human review',
          null,
        ],
        default: null,
      },
      claimSummary: { type: String, default: '' },
      explanation: { type: String, default: '' },
      verificationRequirements: [{ type: String }],
      supportingEvidence: [
        {
          documentId: { type: String },
          documentName: { type: String },
          pageNumber: { type: mongoose.Schema.Types.Mixed, default: 1 },
          quotation: { type: String },
          relevance: { type: String },
        },
      ],
      missingRequirements: [{ type: String }],
      potentialInconsistencies: [{ type: String }],
      uncertainties: [{ type: String }],
      limitations: [{ type: String }],
      recommendedActions: [{ type: String }],
      requiresHumanReview: { type: Boolean, default: false },
      assessedAt: { type: Date, default: null },
      deterministicVerification: {
        quotationsChecked: { type: Number, default: 0 },
        quotationsVerifiedInText: { type: Number, default: 0 },
        flags: [{ type: String }],
      },
    },
    reviewRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date, default: null },
      reason: { type: String, default: '' },
    },
    humanReviewDecision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanReview',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Assessment = mongoose.model('Assessment', assessmentSchema);
