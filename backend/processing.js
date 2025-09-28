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


for(const sentence of sentences){
    if(sentence.toLowerCase().includes(" is ")){
        const parts=sentence.split(" is ");
        flashcards.push({front:parts[0].trim(),back: parts[1].trim()});
    }
}
return{flashcards:flashcards,createdAt: new Date()};
}

/**
 * Saves a new note object to the local notes.json file.
 * @param {object} newNote-The note boject to be saved
 */

function saveNoteLocally(newNote){
    //1. read the existing notes
    const notes=getNotesLocally();
    // 2. Add the new note to the list
    notes.push(newNote);
    //3.Write the entire updated list back to the file 
    fs.writeFileSync(DB_PATH, JSON.stringify(notes,null,2));
}

function getNotesLocally() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file is empty or doesn't exist, return an empty array
    return [];
  }
}


/**
 * Reads local sentes and splits each string based on : and returns our flashcard
 * @returns{Array<{front:string, back: string}>}
 */

function getFlashcardsFromLocalSentences(){
    try{
        const raw=fs.readFileSync(LOCAL_SENTENCES,'utf8');
        const sentences=JSON.parse(raw);
        const flashcards=sentences.map(s=>{
            //If multiple delimiters exist, we keep the first inthe front adn teh rest in the back
            const parts=s.split('::');
            const front=(parts.shift() || '').trim();
            const back=parts.join('::').trim();
            return{front,back};
        });
        return flashcards;

    }catch(err){
        //if missing file return empty erray
        return[];
    }
}
module.exports={
    createNotesFromKeywords,
    saveNoteLocally,
    getNotesLocally,
    getFlashcardsFromLocalSentences,
};