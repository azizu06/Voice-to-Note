import React from "react";
import Flashcard from "./flashcard";
import { useState } from "react";

export default function FlashcardPage() {
    
    const flashcards = [
        { question: "What is the capital of France?", answer: "Paris" },
        { question: "What is 2 + 2?", answer: "4" },
        { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
        { question: "Who wrote 'To Kill a Mockingbird'?", answer: "Harper Lee" },
        { question: "What is the chemical symbol for water?", answer: "H2O" },
        { question: "What year did the Titanic sink?", answer: "1912" },
        { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
        { question: "What is the smallest prime number?", answer: "2" },
        { question: "What is the hardest natural substance on Earth?", answer: "Diamond" },
        { question: "Who developed the theory of relativity?", answer: "Albert Einstein" }
    ]

    function handleFlashcardClick() {
        Flashcard();
    }

    return (
        <div>
            <h1>Flashcards</h1>
            <p>Study using flashcards below</p>
            <div className="flashcard-container" onClick={handleFlashcardClick}>
                {flashcards.map((card, index) => (<Flashcard key={index} question={card.question} answer={card.answer} />))}
            </div>
        </div>
    );
}