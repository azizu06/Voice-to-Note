try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed or .env not present - ignore
}
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const { 
  createNotesFromKeywords, 
  saveNoteLocally, 
  getNotesLocally,
  getFlashcardsFromLocalSentences
} = require('./processing');

const app = express();
const port = 3001;

app.use(express.json());

// Simple CORS middleware (no external dependency)
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to load flashcards.' });
  }
});

// Transcribe base64 audio and convert to JSON flashcard strings using OpenAI
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audio_base64, filename = 'audio.wav', mimetype = 'audio/wav', save = true } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || process.env.OPENAIKEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured in .env' });
    if (!audio_base64) return res.status(400).json({ error: 'audio_base64 is required in request body' });

    const buffer = Buffer.from(audio_base64, 'base64');

    // Prepare multipart/form-data for Whisper transcription
    // Support both Web Fetch FormData (Node 18+) and the 'form-data' package style.
    let formData;
    let formHeaders = {};
    if (typeof FormData !== 'undefined') {
      formData = new FormData();
      // Web FormData in Node accepts (name, value, filename)
      formData.append('file', buffer, filename);
      formData.append('model', 'whisper-1');
      // fetch will set headers for Web FormData automatically
    } else {
      // Try to use the older 'form-data' package shape if available
      try {
        const FormDataNode = require('form-data');
        formData = new FormDataNode();
        formData.append('file', buffer, { filename, contentType: mimetype });
        formData.append('model', 'whisper-1');
        formHeaders = formData.getHeaders();
      } catch (e) {
        return res.status(500).json({ error: 'FormData is not available in this Node runtime. Install `form-data` or run on Node 18+.' });
      }
    }

    const tResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: Object.assign({ Authorization: `Bearer ${apiKey}` }, formHeaders),
      body: formData,
    });

    if (!tResp.ok) {
      const txt = await tResp.text();
      return res.status(502).json({ error: 'Whisper transcription failed', details: txt });
    }

    const tJson = await tResp.json();
    const transcript = tJson.text || '';

    // Ask GPT to format transcript into JSON array of "Front::Back" strings
    const systemPrompt = `You are a helpful assistant that converts a transcript into an array of short flashcard strings in JSON format. Each string must use the delimiter '::' between the front and back (e.g. \"Term::Definition\"). Prefer concise fronts and clear backs. When a sentence contains a clear "front: back" pattern, use it. If no clear separator exists, produce a short summary as front and a short explanation as back. Return only a valid JSON array of strings, nothing else.`;

    const chatBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcript:\n${transcript}` }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    };

    const cResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(chatBody),
    });

    if (!cResp.ok) {
      const txt = await cResp.text();
      return res.status(502).json({ error: 'GPT summarization failed', details: txt });
    }

    const cJson = await cResp.json();
    const content = cJson.choices && cJson.choices[0] && cJson.choices[0].message && cJson.choices[0].message.content;

    // Try to parse JSON array from content
    let parsed = [];
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // fallback: extract first JSON array substring
      const m = content && content.match(/\[([\s\S]*?)\]/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = []; }
      }
    }

    if (!Array.isArray(parsed)) parsed = [];
 
    // Optionally save to local_sentences.json (overwrites)
    if (save) {
      try {
        const out = path.resolve(__dirname, 'local_sentences.json');
        fs.writeFileSync(out, JSON.stringify(parsed, null, 2), 'utf8');
      } catch (e) {
        // ignore write errors but report
        return res.status(500).json({ error: 'Failed to save generated sentences', details: e.message });
      }
    }

    return res.json({ transcript, generated: parsed });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err && err.message });
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

// Safe health/config endpoint - does NOT return the key, only a boolean flag.
app.get('/api/config', (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || process.env.OPENAIKEY);
  res.json({ openai_api_key_configured: hasKey });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
