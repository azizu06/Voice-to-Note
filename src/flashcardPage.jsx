import React, { useEffect, useState } from "react";
import Flashcard from "./flashcard";
import { Link } from "react-router-dom";
import './flashcardPage.css';

export default function FlashcardPage() {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="flashcard-page">
            <Link to="/" className="back-button">← Back Home</Link>
            <h1>Flashcards</h1>
            <p>Here Are The Results Of Your Voice Recordings. Click On A Card To Flip It.</p>

            {loading && <div className="loading">Loading flashcards…</div>}
            {error && <div className="error">Error: {error}</div>}

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