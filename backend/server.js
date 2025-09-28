import express from 'express';

import { 
  createNotesFromKeywords, 
  saveNoteLocally, 
  getNotesLocally,
  getFlashcardsFromLocalSentences
} from './processing.js';

const app = express();
const port = 3001;

app.use(express.json());

// Simple CORS middleware (small replacement for the 'cors' package)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/process-text', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  const notes = createNotesFromKeywords(text);
  saveNoteLocally(notes);
  res.status(201).json(notes);
});

app.get('/api/notes', (req, res) => {
  const notes = getNotesLocally();
  res.json(notes);
});

app.get('/api/flashcards', (req, res) => {
  try {
    const flashcards = getFlashcardsFromLocalSentences();
    res.json({ flashcards });
  } catch {
    res.status(500).json({ error: 'Failed to load flashcards.' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Voice-to-Note API',
    endpoints: [
      { method: 'POST', path: '/api/process-text' },
      { method: 'GET', path: '/api/notes' },
      { method: 'GET', path: '/api/flashcards' }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});