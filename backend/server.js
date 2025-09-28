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
