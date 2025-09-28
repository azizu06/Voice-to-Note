import './flashcard.css';
import React, { useState } from 'react';

export default function Flashcard({ question, answer }) {

    const [flipped, setFlipped] = useState(false);

    return (
    <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        {flipped ? <h3>{answer}</h3> : <h3>{question}</h3>}
    </div>
    );
}