import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import ePub from 'epubjs';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Detect file type from file object
 */
export function detectFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type.toLowerCase();

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  } else if (extension === 'epub' || mimeType === 'application/epub+zip') {
    return 'epub';
  } else if (extension === 'txt' || mimeType === 'text/plain') {
    return 'txt';
  }
  return 'txt'; // Default to txt
}

/**
 * Parse PDF file and extract text using pdfjs-dist
 */
export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Iterate through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

/**
 * Parse EPUB file and extract text
 */
export async function parseEPUB(file) {
  const arrayBuffer = await file.arrayBuffer();
  const book = ePub(arrayBuffer);
  await book.ready;

  const spine = await book.loaded.spine;
  const textParts = [];

  // Extract text from each section
  for (const item of spine.items) {
    try {
      const doc = await book.load(item.href);
      // Get text content, handling different node types if necessary,
      // but doc.textContent usually works for the whole document fragment
      const text = doc.textContent || doc.body?.textContent || '';
      textParts.push(text);
    } catch (error) {
      console.warn('Failed to load EPUB section:', error);
    }
  }

  return textParts.join('\n\n');
}

/**
 * Parse TXT file
 */
export async function parseTXT(file) {
  return file.text();
}

/**
 * Normalize text - clean and prepare for tokenization
 */
export function normalizeText(text) {
  return text
    // Normalize Unicode
    .normalize('NFKC')
    // Merge hyphenated line breaks
    .replace(/-\n/g, '')
    // Preserve paragraph boundaries (2+ newlines)
    .replace(/\n{2,}/g, '\n\n§PARAGRAPH§\n\n')
    // Collapse other whitespace
    .replace(/\s+/g, ' ')
    // Restore paragraph markers
    .replace(/\s*§PARAGRAPH§\s*/g, '\n\n')
    // Trim
    .trim();
}

/**
 * Calculate Optimal Recognition Point (ORP) for a word
 */
export function calculateORP(word) {
  const length = word.length;
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
}

/**
 * Check if word ends with sentence-ending punctuation
 */
function hasSentenceEnding(word) {
  return /[.!?;:]$/.test(word);
}

/**
 * Tokenize text into word tokens with metadata
 */
export function tokenize(text) {
  const tokens = [];
  const paragraphs = text.split(/\n{2,}/);

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    const words = paragraph.split(/\s+/);

    for (const word of words) {
      if (!word) continue;

      tokens.push({
        text: word,
        focusIndex: calculateORP(word),
        flags: {
          punctuation: hasSentenceEnding(word),
          paragraphBreak: false,
        },
      });
    }

    // Add paragraph break marker (except after last paragraph)
    if (i < paragraphs.length - 1) {
      tokens.push({
        text: '',
        focusIndex: 0,
        flags: {
          punctuation: false,
          paragraphBreak: true,
        },
      });
    }
  }

  return tokens;
}

/**
 * Process document - full pipeline from file to tokens
 */
export async function processDocument(file) {
  const fileType = detectFileType(file);
  let rawText = '';

  // Extract text based on file type
  try {
    switch (fileType) {
      case 'pdf':
        rawText = await parsePDF(file);
        break;
      case 'epub':
        rawText = await parseEPUB(file);
        break;
      case 'txt':
      default:
        rawText = await parseTXT(file);
        break;
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse ${fileType.toUpperCase()} file: ${error.message}`);
  }

  // Normalize and tokenize
  const normalizedText = normalizeText(rawText);
  const words = tokenize(normalizedText);

  if (words.length === 0) {
    throw new Error('No text content found in document');
  }

  return {
    id: crypto.randomUUID(),
    title: file.name,
    type: fileType,
    rawText,
    words,
    createdAt: Date.now(),
  };
}
