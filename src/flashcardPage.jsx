import React, { useEffect, useState } from "react";
import Flashcard from "./flashcard";
import { Link } from "react-router-dom";
import './flashcardPage.css';

export default function FlashcardPage() {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/flashcards')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                if (!mounted) return;
                setFlashcards((data && data.flashcards) || []);
            })
            .catch(err => {
                if (!mounted) return;
                setError(err.message || 'Failed to load');
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, []);

    async function handleFile(e) {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setUploading(true);
        setError(null);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio_base64: b64, filename: f.name, mimetype: f.type || 'audio/wav', save: true })
            });
            if (!res.ok) throw new Error('Transcription request failed');
            const json = await res.json();
            setTranscript(json.transcript || '');
            if (Array.isArray(json.generated)) {
                // map generated strings ("Front::Back") to objects
                const parsed = json.generated.map(s => {
                    const parts = String(s || '').split('::');
                    return { front: (parts[0] || '').trim(), back: (parts[1] || '').trim() };
                });
                setFlashcards(parsed);
            }
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flashcard-page">
            <Link to="/" className="back-button">← Back Home</Link>
            <h1>Flashcards</h1>
            <p>Here Are The Results Of Your Voice Recordings. Click On A Card To Flip It.</p>

            <div className="uploader">
                <label htmlFor="audioUpload">Upload audio (wav/mp3):</label>
                <input id="audioUpload" type="file" accept="audio/*" onChange={handleFile} />
                {uploading && <div className="loading">Uploading and transcribing…</div>}
            </div>

            {loading && <div className="loading">Loading flashcards…</div>}
            {error && <div className="error">Error: {error}</div>}

            {transcript && (
                <div className="transcript">
                    <h3>Transcript</h3>
                    <p>{transcript}</p>
                </div>
            )}

            <div className="flashcard-container">
                {flashcards.map((card, index) => (
                    <Flashcard 
                        key={index}
                        front={card.front || ''}
                        back={card.back || ''}
                    />
                ))}
            </div>
        </div>
    );
}