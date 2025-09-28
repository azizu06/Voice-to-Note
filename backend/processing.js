const fs=require('fs')
const DB_PATH='./notes.json'//this si the path to our local database file 
const Local_SENTENCES='./local_sentences.json'//path to our sentence

/**
 * Takes a test trans and creates flashcards based of a keyword
 * @param {string} trnascript-Input text
 * @returns {object} An object contaiinng the gen flashcards
 */

//create our notes function

function createNotesFromKeywords(transcript){
    const flashcards=[];
    const sentences=transcript.split('.');
}

for(const sentence of sentences){
    if(sentence.toLowerCase().includes("is")){
        const parts=sentence.split("is");
        flashcards.push({front:parts[0].trim(),back: parts[1].trim()});
    }
}