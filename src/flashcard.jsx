import './flashcard.css';
import React, { useState } from 'react';

export default function Flashcard({ question, answer }) {
    const [flipped, setFlipped] = useState(false);

    const handleClick = () => {
        setFlipped(!flipped);
    };

    return (
        <div 
            className={`flashcard ${flipped ? "flipped" : ""}`} 
            onClick={handleClick}
        >
            {flipped ? <h3>{answer}</h3> : <h3>{question}</h3>}
            <div className="flashcard-instruction">
                {flipped ? "Click to see question" : "Click to see answer"}
            </div>
        </div>
    );
}