const express = require('express');
// Import your local processing functions
const { 
  createNotesFromKeywords, 
  saveNoteLocally, 
  getNotesLocally,
  getFlashcardsFromLocalSentences
} = require('./processing');

const app = express();
const port = 3001;

// This middleware is crucial for receiving JSON data from the frontend
app.use(express.json());

// Endpoint to process new text and create notes
app.post('/api/process-text', (req, res) => {
  // Get the text from the request body instead of a file
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  // Use your local functions to process and save the notes
  const notes = createNotesFromKeywords(text);
  saveNoteLocally(notes);

  // Send the newly created notes back as a response
  res.status(201).json(notes);
});

// Endpoint to get all previously saved notes
app.get('/api/notes', (req, res) => {
  const notes = getNotesLocally();
  res.json(notes);
});

// Endpoint to return flashcards generated from local_sentences.json
app.get('/api/flashcards', (req, res) => {
  try {
    const flashcards = getFlashcardsFromLocalSentences();
    res.json({ flashcards });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load flashcards.' });
  }
});

// Root route to help in the browser and list available endpoints
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

// Simple visualizer for flashcards (no frontend build required)
app.get('/view/flashcards', (req, res) => {
  try {
    const flashcards = getFlashcardsFromLocalSentences();
    // Render a minimal HTML page with inline CSS/JS that shows flip-on-click cards
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Flashcards Preview</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 24px; background:#f7f7f8 }
    .grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:16px }
    .card { background:#fff; border-radius:8px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.08); cursor:pointer; min-height:100px; display:flex; align-items:center; justify-content:center; text-align:center }
    .front { font-weight:600 }
    .back { display:none; color:#333 }
    .card.flipped .front { display:none }
    .card.flipped .back { display:block }
  </style>
</head>
<body>
  <h1>Flashcards Preview</h1>
  <p>Click any card to flip. Data loaded from local_sentences.json</p>
  <div class="grid">
    ${flashcards.map(fc => `
      <div class="card" tabindex="0" role="button" onclick="this.classList.toggle('flipped')" onkeydown="if(event.key==='Enter')this.classList.toggle('flipped')">
        <div class="front">${escapeHtml(fc.front)}</div>
        <div class="back">${escapeHtml(fc.back || '<em>(no back provided)</em>')}</div>
      </div>
    `).join('')}
  </div>
  <script>
    // keyboard navigation: flip with Space
    document.addEventListener('keydown', e => {
      if (e.key === ' ') {
        const el = document.activeElement;
        if (el && el.classList && el.classList.contains('card')) el.classList.toggle('flipped');
      }
    });
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send('<pre>Failed to render flashcards</pre>');
  }
});

// small helper to escape HTML (used when injecting strings below)
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s] || s));
}

app.listen(port, () => {
  console.log(`Basic MVP server running on http://localhost:${port}`);
});