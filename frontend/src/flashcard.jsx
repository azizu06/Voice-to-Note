import './flashcard.css';
import React, { useState } from 'react';

export default function Flashcard({ front, back }) {
    const [flipped, setFlipped] = useState(false);

    const handleClick = () => setFlipped(f => !f);

    return (
        <div 
            className={`flashcard ${flipped ? "flipped" : ""}`} 
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f); }}
        >
            {flipped ? <h3>{back}</h3> : <h3>{front}</h3>}
            <div className="flashcard-instruction">
                {flipped ? "Click or press Enter to see front" : "Click or press Enter to see back"}
            </div>
        </div>
    );
}