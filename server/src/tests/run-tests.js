import {
  imageAnalysisResponseSchema,
  assessmentResponseSchema,
  verifyQuotationsInExtractedText,
  detectClaimsFromImage,
  assessClaimWithEvidence,
} from '../services/gemini.service.js';
import { extractDocumentText } from '../services/extraction.service.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- RUNNING GREENPROOF AI BACKEND TESTS ---\n');

  // Test 1: Zod schema validates correct 4 status labels
  console.log('Test Suite 1: Status Label & Schema Validation');
  const validStatuses = [
    'Supported by available evidence',
    'Insufficient evidence',
    'Potential inconsistency',
    'Needs human review',
  ];

  validStatuses.forEach((status) => {
    const validReport = {
      status,
      claimSummary: '100% Biodegradable in 30 days',
      explanation: 'Technical test report indicates complete degradation within 30 days under ASTM D5511.',
      verificationRequirements: ['ASTM D5511 test method', 'Batch serial verification'],
      supportingEvidence: [
        {
          documentId: 'doc_1',
          documentName: 'biodegradability_test.pdf',
          pageNumber: 'Page 3',
          quotation: 'Sample achieved 98.4% biodegradation within 28 days under anaerobic conditions.',
          relevance: 'Directly validates degradation kinetics.',
        },
      ],
      missingRequirements: [],
      potentialInconsistencies: [],
      uncertainties: ['Industrial facility versus open environment.'],
      limitations: ['Test performed at 58°C.'],
      recommendedActions: ['Provide home compostability confirmation.'],
      requiresHumanReview: false,
    };

    const result = assessmentResponseSchema.safeParse(validReport);
    assert(result.success, `Schema accepts valid status: "${status}"`);
  });

  // Invalid status rejection test
  const invalidReport = {
    status: 'True and Certified Green', // Not allowed!
    claimSummary: 'Bad status test',
    explanation: 'Test',
    verificationRequirements: [],
  };
  const invalidResult = assessmentResponseSchema.safeParse(invalidReport);
  assert(!invalidResult.success, 'Schema strictly rejects unauthorized status labels');

  // Test 2: Deterministic quotation verifier
  console.log('\nTest Suite 2: Deterministic Evidence Quotation Verifier');
  const mockEvidenceDocs = [
    {
      originalName: 'lab_report_iso14855.pdf',
      extractedText:
        'Intertek Testing Services. Sample Biodegradable Cup Batch #4412. The test specimen exhibited 94.2% biodegradation after 45 days in thermophilic composting conditions. No toxic residues detected.',
    },
  ];

  const legitimateEvidence = [
    {
      documentName: 'lab_report_iso14855.pdf',
      quotation: 'exhibited 94.2% biodegradation after 45 days',
      relevance: 'Test result metric',
    },
  ];

  const legitimateCheck = verifyQuotationsInExtractedText(legitimateEvidence, mockEvidenceDocs);
  assert(legitimateCheck.quotationsVerifiedInText === 1, 'Legitimate quotation correctly verified in document text');
  assert(legitimateCheck.flags.length === 0, 'No warning flags for verified legitimate quotation');

  const hallucinatedEvidence = [
    {
      documentName: 'lab_report_iso14855.pdf',
      quotation: '100% carbon negative certified by United Nations', // Not in text!
      relevance: 'Fabricated claim',
    },
  ];

  const hallucinatedCheck = verifyQuotationsInExtractedText(hallucinatedEvidence, mockEvidenceDocs);
  assert(hallucinatedCheck.quotationsVerifiedInText === 0, 'Hallucinated quotation is flagged and unverified');
  assert(hallucinatedCheck.flags.length === 1, 'Warning flag raised for quotation not found in document text');

  // Test 3: Document text extraction
  console.log('\nTest Suite 3: Document Text Extraction');
  const tempTxtPath = path.resolve(process.cwd(), 'temp_test_doc.txt');
  fs.writeFileSync(
    tempTxtPath,
    'ISO 14021 Compliance Statement.\n\nAll packaging fibers originate from FSC certified plantations.\nRecycled content ratio: 75% Post Consumer Waste.'
  );

  const txtExtraction = await extractDocumentText(tempTxtPath, 'temp_test_doc.txt', 'txt');
  assert(txtExtraction.success === true, 'TXT extraction succeeds');
  assert(txtExtraction.extractedText.includes('FSC certified'), 'Extracted text preserves core keywords');
  assert(txtExtraction.passages.length >= 2, 'Passage segmenter creates structured passages');

  if (fs.existsSync(tempTxtPath)) {
    fs.unlinkSync(tempTxtPath);
  }

  // Test 4: Assessment without evidence honesty rule
  console.log('\nTest Suite 4: Assessment Without Evidence Honesty Rule');
  const noEvidenceAssessment = await assessClaimWithEvidence({
    companyName: 'EcoCo',
    productName: 'EcoBottle',
    productDescription: 'Water bottle',
    selectedClaim: { claimText: '100% Ocean Bound Plastic' },
    evidenceDocuments: [], // EMPTY
  });

  assert(
    noEvidenceAssessment.status === 'Insufficient evidence',
    'Assessment without evidence strictly returns "Insufficient evidence"'
  );
  assert(
    noEvidenceAssessment.explanation.includes('No supporting evidence documents were uploaded'),
    'Assessment explains that photographs alone cannot prove environmental properties'
  );

  console.log(`\n===========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
