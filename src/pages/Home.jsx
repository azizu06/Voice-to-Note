import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../header';
import './Home.css';

const Home = () => {
const [navVisible, setNavVisible] = useState(true);
const [buttonVisible, setButtonVisible] = useState(false);
const [audioFile, setAudioFile] = useState(null);
const [fileName, setFileName] = useState('No file chosen');

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAudioFile(file);
        setFileName(file.name);
    }
};

const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally process the audio file
    // For now, we'll just navigate to the flashcards page
    console.log('Audio file submitted:', audioFile);
    window.location.href = "/flashcards";
};

useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
const currentScrollY = window.scrollY;


if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavVisible(false);
} else {
        setNavVisible(true);
}


lastScrollY = currentScrollY;


setButtonVisible(currentScrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
}, []); 
return (
    <div className="home-page">


<nav className={`navbar ${navVisible ? '' : 'navbar-hidden'}`}>
        <div className="nav-container">
<div className="logo">VoiceNote

</div>
        </div>
</nav> 


<header className="hero" id="home">
        <Header />
        <div className="hero-content">
            <p className="hero-subtitle">This App Will Allow You To Transform Your Voice Into Personalized Notes</p>
            <div className="hero-actions">
            <div className="hero-file-container">
                <label htmlFor="hero-audio-upload" className="hero-file-label">
                    <span className="file-icon">🎤</span>
                    <span>Choose Audio File</span>
                </label>
                <input 
                    type="file" 
                    id="hero-audio-upload"
                    accept="audio/*" 
                    className="file-input" 
                    onChange={handleFileChange}
                />
            </div>
            <button 
                onClick={handleSubmit} 
                className="hero-button"
                disabled={!audioFile}
            >
                Convert to Flashcards
            </button>
            </div>
        </div>
</header>


<div className={`get-started-container ${buttonVisible ? 'visible' : ''}`}>
        <form onSubmit={handleSubmit}>
            <div className="file-input-container">
                <label htmlFor="audio-upload" className="file-input-label">
                    <span className="file-icon">🎤</span>
                    <span className="file-text">{fileName}</span>
                </label>
                <input 
                    type="file" 
                    id="audio-upload"
                    accept="audio/*" 
                    className="file-input" 
                    onChange={handleFileChange}
                />
            </div>
            <button 
                type="submit" 
                className="get-started-button" 
                disabled={!audioFile}
            >
                Submit Audio
            </button>
        </form>
</div>


    </div>
);
};

export default Home;