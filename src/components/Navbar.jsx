import React from 'react';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#home" className="brand">Voice<span>Note</span></a>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#help">Help</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
