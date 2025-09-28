const fs = require('fs');
const path = require('path');

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
  if (idx !== -1) return { front: s.slice(0, idx).trim(), back: s.slice(idx + 1).trim() };

  const isRegex = /\s+is\s+/i;
  if (isRegex.test(s)) {
    const parts = s.split(isRegex);
    return { front: parts[0].trim(), back: (parts[1] || '').trim() };
  }

  return { front: s, back: '' };
}

function createNotesFromKeywords(transcript) {
  const flashcards = [];
  const text = String(transcript || '');
  const sentences = text.split(/\r?\n|[.?!]+/).map(s => s.trim()).filter(Boolean);
  for (const sentence of sentences) {
    const card = parseLineToFlashcard(sentence);
    if (card.front || card.back) flashcards.push(card);
  }
  return { flashcards, createdAt: new Date() };
}

function saveNoteLocally(newNote) {
  const notes = getNotesLocally();
  notes.push(newNote);
  fs.writeFileSync(DB_PATH, JSON.stringify(notes, null, 2), 'utf8');
}

function getNotesLocally() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function getFlashcardsFromLocalSentences() {
  try {
    const raw = fs.readFileSync(LOCAL_SENTENCES, 'utf8');
    const sentences = JSON.parse(raw);
    if (!Array.isArray(sentences)) return [];
    return sentences.map(s => parseLineToFlashcard(s));
  } catch {
    return [];
  }
}

module.exports = {
  parseLineToFlashcard,
  createNotesFromKeywords,
  saveNoteLocally,
  getNotesLocally,
  getFlashcardsFromLocalSentences,
};