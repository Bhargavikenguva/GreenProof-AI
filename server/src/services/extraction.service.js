import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Splits raw text into readable passages/paragraphs with source reference
 */
function breakIntoPassages(text, sourcePrefix = 'Page 1') {
  if (!text) return [];
  // Split on double line breaks or bullet points
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20); // ignore micro fragments

  return paragraphs.map((content, idx) => ({
    pageNumber: `${sourcePrefix} · ¶${idx + 1}`,
    text: content,
  }));
}

/**
 * Extracts text and passages from PDF, DOCX, or TXT
 */
export async function extractDocumentText(filePath, originalName, fileType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    if (fileType === 'txt') {
      const text = fileBuffer.toString('utf-8');
      if (!text.trim()) {
        return {
          success: false,
          extractionStatus: 'failed',
          extractedText: '',
          passages: [],
          pageCount: 1,
          errorMessage: 'TXT file is empty or contains no readable characters.',
        };
      }
      const passages = breakIntoPassages(text, 'Section 1');
      return {
        success: true,
        extractionStatus: 'success',
        extractedText: text,
        passages: passages.length > 0 ? passages : [{ pageNumber: 'Line 1', text }],
        pageCount: 1,
        errorMessage: null,
      };
    }

    if (fileType === 'pdf') {
      try {
        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text || '';
        const pageCount = pdfData.numpages || 1;

        if (!extractedText.trim()) {
          return {
            success: false,
            extractionStatus: 'failed',
            extractedText: '',
            passages: [],
            pageCount,
            errorMessage: 'PDF does not contain selectable text (may be scanned image/raster PDF without OCR).',
          };
        }

        // pdf-parse provides page breaks usually delineated or full text.
        // Let's create structured passages
        const rawPassages = breakIntoPassages(extractedText, 'Page 1');

        return {
          success: true,
          extractionStatus: 'success',
          extractedText,
          passages: rawPassages.length > 0 ? rawPassages : [{ pageNumber: 'Page 1', text: extractedText }],
          pageCount,
          errorMessage: null,
        };
      } catch (pdfErr) {
        return {
          success: false,
          extractionStatus: 'failed',
          extractedText: '',
          passages: [],
          pageCount: 0,
          errorMessage: `PDF extraction failed: ${pdfErr.message}`,
        };
      }
    }

    if (fileType === 'docx') {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const extractedText = result.value || '';

        if (!extractedText.trim()) {
          return {
            success: false,
            extractionStatus: 'failed',
            extractedText: '',
            passages: [],
            pageCount: 1,
            errorMessage: 'DOCX document contains no readable text content.',
          };
        }

        const passages = breakIntoPassages(extractedText, 'Doc Paragraph');

        return {
          success: true,
          extractionStatus: 'success',
          extractedText,
          passages: passages.length > 0 ? passages : [{ pageNumber: 'Doc Section', text: extractedText }],
          pageCount: 1,
          errorMessage: null,
        };
      } catch (docxErr) {
        return {
          success: false,
          extractionStatus: 'failed',
          extractedText: '',
          passages: [],
          pageCount: 0,
          errorMessage: `DOCX extraction failed: ${docxErr.message}`,
        };
      }
    }

    return {
      success: false,
      extractionStatus: 'failed',
      extractedText: '',
      passages: [],
      pageCount: 0,
      errorMessage: `Unsupported file type: ${fileType}`,
    };
  } catch (err) {
    return {
      success: false,
      extractionStatus: 'failed',
      extractedText: '',
      passages: [],
      pageCount: 0,
      errorMessage: `File read error: ${err.message}`,
    };
  }
}
