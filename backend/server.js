const express = require('express');

const { 
  createNotesFromKeywords, 
  saveNoteLocally, 
  getNotesLocally,
  getFlashcardsFromLocalSentences
} = require('./processing');

const app = express();
const port = 3001;

app.use(express.json());

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
  } catch (err) {
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
