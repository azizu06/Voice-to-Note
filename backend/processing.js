import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, 'notes.json');
const LOCAL_SENTENCES = path.resolve(__dirname, 'local_sentences.json');

function parseLineToFlashcard(line) {
  const s = String(line || '').trim();
  if (!s) return { front: '', back: '' };

  if (s.includes('::')) {
    const [front, ...rest] = s.split('::');
    return { front: front.trim(), back: rest.join('::').trim() };
  }

  const idx = s.indexOf(':');
  if (idx !== -1) {
    return { front: s.slice(0, idx).trim(), back: s.slice(idx + 1).trim() };
  }

  const isMatch = /\s+is\s+/i;
  if (isMatch.test(s)) {
    const parts = s.split(isMatch);
    return { front: parts[0].trim(), back: (parts[1] || '').trim() };
  }

  return { front: s, back: '' };
}

export function createNotesFromKeywords(transcript) {
  const flashcards = [];
  const text = String(transcript || '');
  const sentences = text.split(/\r?\n|[.?!]+/).map(s => s.trim()).filter(Boolean);

  for (const sentence of sentences) {
    const card = parseLineToFlashcard(sentence);
    if (card.front || card.back) flashcards.push(card);
  }

  return { flashcards, createdAt: new Date() };
}

export function saveNoteLocally(newNote) {
  const notes = getNotesLocally();
  notes.push(newNote);
  fs.writeFileSync(DB_PATH, JSON.stringify(notes, null, 2), 'utf8');
}

export function getNotesLocally() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getFlashcardsFromLocalSentences() {
  try {
    const raw = fs.readFileSync(LOCAL_SENTENCES, 'utf8');
    const sentences = JSON.parse(raw);
    if (!Array.isArray(sentences)) return [];
    return sentences.map(s => parseLineToFlashcard(s));
  } catch {
    return [];
  }
}
