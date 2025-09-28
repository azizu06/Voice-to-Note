import React from 'react';
import Navbar from '../components/Navbar';
import './home.css';

// Red-themed glowing microphone icon
const MicrophoneIcon = () => (
  <svg
    width="86"
    height="86"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mic-glow"
  >
    <defs>
      <filter id="glow-red">
        <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M12 2C10.343 2 9 3.343 9 5v6c0 1.657 1.343 3 3 3s3-1.343 3-3V5c0-1.657-1.343-3-3-3Z"
      stroke="#ef4444"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow-red)"
    />
    <path
      d="M19 10v1a7 7 0 1 1-14 0v-1"
      stroke="#f97316"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18v4"
      stroke="#ef4444"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Home = () => {
  return (
    <div id="home" className="page">
      <Navbar />

      {/* Hero */}
      <header className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="mic-wrap"><MicrophoneIcon /></div>
          <h1 className="title">Record. Capture. Conquer</h1>
          <p className="subtitle">
            Turn voice notes into study-ready flashcards in seconds—built for fast-paced campus life.
          </p>
          <div className="cta-row">
            <a className="btn-primary" href="#get-started">Start Recording</a>
            <a className="btn-ghost" href="#about">Learn More</a>
          </div>
        </div>
      </header>

      {/* About */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">Why Voice<span>Note</span>?</h2>
          <p className="section-text">
            Built with state-of-the-art transcription and summarization, VoiceNote helps you focus on learning, not paperwork. Upload a lecture or record a thought—get organized notes and flashcards automatically.
          </p>
          <ul className="features">
            <li><strong>Fast</strong> results tailored for students on the go.</li>
            <li><strong>Accurate</strong> transcription powered by modern AI models.</li>
            <li><strong>Actionable</strong> outputs: summaries, highlights, and ready-made flashcards.</li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section alt">
        <div className="container">
          <h2 className="section-title">Get in touch</h2>
          <p className="section-text">
            Questions, ideas, or feedback? We’d love to hear from you.
          </p>
          <div className="contact-grid">
            <a className="contact-card" href="mailto:hello@voicenote.app">
              <span className="card-title">Email</span>
              <span className="card-text">hello@voicenote.app</span>
            </a>
            <a className="contact-card" href="#" aria-disabled="true">
              <span className="card-title">Discord</span>
              <span className="card-text">Coming soon</span>
            </a>
          </div>
        </div>
      </section>

      {/* Help */}
      <section id="help" className="section">
        <div className="container">
          <h2 className="section-title">Help & FAQ</h2>
          <details className="faq">
            <summary>How do I create flashcards from a recording?</summary>
            <p>Hit “Start Recording” on the home section or upload an audio file. We’ll transcribe and generate flashcards instantly.</p>
          </details>
          <details className="faq">
            <summary>Is there a free plan?</summary>
            <p>Yes—get started for free with generous limits. Upgrade for longer recordings and advanced features.</p>
          </details>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} VoiceNote • All rights reserved.</footer>
    </div>
  );
};

export default Home;
