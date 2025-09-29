/* eslint-env node */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { Buffer } from 'buffer';

// create a local alias so linters that don't know Node globals stop complaining
const process = globalThis.process;

import { 
  createNotesFromKeywords, 
  saveNoteLocally, 
  getNotesLocally,
  getFlashcardsFromLocalSentences
} from './processing.js';

const app = express();
const port = 3001;

console.log('Starting Voice-to-Note server (initializing)...');

app.use(express.json({ limit: '50mb' }));

// Simple CORS middleware (small replacement for the 'cors' package)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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
      { method: 'GET', path: '/api/flashcards' },
      { method: 'POST', path: '/api/transcribe' }
    ]
  });
});

// Helper to resolve backend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_SENTENCES_PATH = path.resolve(__dirname, 'local_sentences.json');

// POST /api/transcribe
// Accepts JSON { audio_base64, filename, mimetype, save }
app.post('/api/transcribe', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.OPENAI;

    const { audio_base64, filename, mimetype, save } = req.body || {};
    // allow older test helper that uses 'content'
    const base64 = audio_base64 || req.body.content;
    const name = filename || req.body.filename || 'upload.wav';
    const type = mimetype || req.body.mimetype || 'audio/wav';

    if (!base64) return res.status(400).json({ error: 'No audio provided (audio_base64 or content)' });

    // If API key is not present, return a demo-friendly fake transcript and generated flashcards
    if (!key) {
      const fakeTranscript = 'Demo transcript: basic facts about photosynthesis. Sunlight is converted to chemical energy. Plants use chlorophyll.';
      const demoGenerated = [
        'Photosynthesis::Process plants use to convert sunlight into chemical energy',
        'Chlorophyll::The green pigment that absorbs light in plants',
        'Sunlight::Energy source for photosynthesis'
      ];

      // Optionally save if requested
      if (save) {
        try {
          let existing = [];
          try { existing = JSON.parse(fs.readFileSync(LOCAL_SENTENCES_PATH, 'utf8')); } catch {}
          const merged = existing.concat(demoGenerated);
          fs.writeFileSync(LOCAL_SENTENCES_PATH, JSON.stringify(merged, null, 2), 'utf8');
        } catch (e) { /* ignore write errors for demo */ }
      }

      return res.json({ transcript: fakeTranscript, generated: demoGenerated, demo: true });
    }

    // Decode base64
    const audioBuffer = Buffer.from(base64, 'base64');

    // Build multipart form data for Whisper transcription
    // Use global FormData/Blob/fetch when available (Node 18+). Otherwise fall back to form-data + node-fetch.
    let transcriptionResp;
    if (typeof FormData !== 'undefined' && typeof Blob !== 'undefined' && typeof fetch !== 'undefined') {
      const form = new FormData();
      const blob = new Blob([audioBuffer], { type });
      form.append('file', blob, name);
      form.append('model', 'whisper-1');

      transcriptionResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form
      });
    } else {
      // dynamic import to avoid adding dependencies when not needed
      const FormDataPkg = await import('form-data');
      const fetchPkg = await import('node-fetch');
      const form = new FormDataPkg.default();
      form.append('file', audioBuffer, { filename: name, contentType: type });
      form.append('model', 'whisper-1');

      transcriptionResp = await fetchPkg.default('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form
      });
    }

    if (!transcriptionResp.ok) {
      const text = await transcriptionResp.text();
      return res.status(502).json({ error: 'Transcription failed', detail: text });
    }

    const transcriptionJson = await transcriptionResp.json();
    const transcript = transcriptionJson.text || '';

    // Now call chat completion to convert transcript into flashcard strings
    const chatPrompt = 'You are a helpful assistant that converts a transcript into an array of short flashcard strings. Given the transcript, return a JSON array (no extra text) of strings where each string is formatted exactly as "Front::Back". Keep each front and back short (one or two phrases). If you cannot produce a back, return an empty string after ::. Transcript:\n\n' + transcript;

    const chatBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You convert transcripts into flashcard strings in the format Front::Back. Return a valid JSON array only.' },
        { role: 'user', content: chatPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    const chatResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(chatBody)
    });

    if (!chatResp.ok) {
      const text = await chatResp.text();
      return res.status(502).json({ error: 'Chat completion failed', detail: text });
    }

    const chatJson = await chatResp.json();
    const assistant = chatJson.choices && chatJson.choices[0] && chatJson.choices[0].message && chatJson.choices[0].message.content;

    // Try to parse assistant content as JSON array, with fallback to extract an array substring
    let generated = [];
    if (assistant) {
      try { generated = JSON.parse(assistant); } catch (e) {
        const m = assistant.match(/\[([\s\S]*?)\]/m);
        if (m) {
          try { generated = JSON.parse(m[0]); } catch { generated = []; }
        }
      }
    }

    // Optionally persist the generated strings to local_sentences.json
    if (save && Array.isArray(generated) && generated.length > 0) {
      try {
        let existing = [];
        try { existing = JSON.parse(fs.readFileSync(LOCAL_SENTENCES_PATH, 'utf8')); } catch {}
        const strings = generated.map(s => String(s));
        const merged = existing.concat(strings);
        fs.writeFileSync(LOCAL_SENTENCES_PATH, JSON.stringify(merged, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to save generated sentences:', err && err.message);
      }
    }

    return res.json({ transcript, generated });
  } catch (err) {
    console.error('Transcribe error', err);
    return res.status(500).json({ error: 'Server error', detail: String(err && err.message) });
  }
});