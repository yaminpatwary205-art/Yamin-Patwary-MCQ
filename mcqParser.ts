import type { MCQ } from '../types';

const BENGALI_LETTERS = ['ক', 'খ', 'গ', 'ঘ'];

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCorrectIndex(options: string[]): number {
  for (let i = 0; i < options.length; i++) {
    const opt = options[i].toLowerCase();
    if (
      opt.includes('✓') ||
      opt.includes('✔') ||
      opt.includes('check') ||
      opt.includes('correct') ||
      opt.includes('(ans)') ||
      opt.includes('(answer)') ||
      opt.includes('[correct]') ||
      opt.includes('->') ||
      opt.includes('=>')
    ) {
      return i;
    }
  }
  return -1;
}

function stripMarkers(option: string): string {
  return option
    .replace(/[✓✔]/g, '')
    .replace(/\(ans\)/gi, '')
    .replace(/\(answer\)/gi, '')
    .replace(/\[correct\]/gi, '')
    .replace(/->/g, '')
    .replace(/=>/g, '')
    .replace(/^[-–—]\s*/, '')
    .trim();
}

function parseQuestionBlock(block: string): Omit<MCQ, 'id' | 'bookId' | 'chapterId'> | null {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) return null;

  let question = '';
  let options: string[] = [];
  let correctIndex = -1;

  // Try to detect question and options
  // Pattern 1: Question on first line, options follow
  // Pattern 2: Numbered question, then options

  const firstLine = lines[0];
  const qMatch = firstLine.match(/^(?:\d+[.)]\s*)?(.+)$/);
  if (qMatch) {
    question = qMatch[1].trim();
  } else {
    question = firstLine;
  }

  // Remove question number prefix from question if present
  question = question.replace(/^\d+[.)]\s*/, '').trim();

  // Parse options from remaining lines
  const optionLines = lines.slice(1);

  for (const line of optionLines) {
    // Match option patterns like A) ..., B. ..., (a) ..., etc.
    const optMatch = line.match(/^([a-dA-D])[.)\]]\s*(.+)$/);
    if (optMatch) {
      options.push(optMatch[2].trim());
    } else if (line.match(/^[কখগঘ][.)\]]\s*(.+)$/)) {
      const bnMatch = line.match(/^[কখগঘ][.)\]]\s*(.+)$/);
      if (bnMatch) options.push(bnMatch[1].trim());
    } else if (line.startsWith('-') || line.startsWith('–') || line.startsWith('—')) {
      options.push(line.replace(/^[-–—]\s*/, '').trim());
    } else {
      // If no pattern matched but line has checkmark, treat as option
      if (line.includes('✓') || line.includes('✔')) {
        options.push(line.trim());
      } else if (options.length > 0 && options.length < 4) {
        // Could be a continuation of previous option or another option
        options.push(line.trim());
      }
    }
  }

  if (options.length < 2) return null;

  // Limit to 4 options
  options = options.slice(0, 4);

  // Pad to 4 if needed (fill with placeholder)
  while (options.length < 4) {
    options.push('(অপশন)');
  }

  correctIndex = extractCorrectIndex(options);

  // Clean markers from all options
  options = options.map(stripMarkers);

  // If no correct answer found, default to first
  if (correctIndex === -1) {
    correctIndex = 0;
  }

  return {
    question: question.trim(),
    options,
    correctIndex,
  };
}

export function parseMCQBulkText(rawText: string): Omit<MCQ, 'id' | 'bookId' | 'chapterId'>[] {
  const text = cleanText(rawText);
  const results: Omit<MCQ, 'id' | 'bookId' | 'chapterId'>[] = [];

  // Split by double newlines or numbered patterns to find question blocks
  // Strategy: find blocks that start with a number or have a question-like structure
  const blocks = text.split(/\n\s*\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Try to split by question numbers if the whole text is one big block
    const numberedSplit = trimmed.split(/(?=\n?\s*\d+[.)]\s+)/);

    const subBlocks = numberedSplit.length > 1 ? numberedSplit : [trimmed];

    for (const sub of subBlocks) {
      const parsed = parseQuestionBlock(sub.trim());
      if (parsed) {
        results.push(parsed);
      }
    }
  }

  return results;
}

export function toBengaliLetter(index: number): string {
  return BENGALI_LETTERS[index] || String(index + 1);
}

export function toBengaliNumber(num: number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((d) => bnDigits[parseInt(d)] || d)
    .join('');
}
