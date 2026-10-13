import mongoose from 'mongoose';

const evidenceDocumentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    extractionStatus: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    extractedText: {
      type: String,
      default: '',
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    passages: [
      {
        pageNumber: {
          type: mongoose.Schema.Types.Mixed, // Can be number or string label like 'Page 1' or 'Section'
          default: 1,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const EvidenceDocument = mongoose.model('EvidenceDocument', evidenceDocumentSchema);
