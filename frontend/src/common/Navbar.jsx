import React, { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "./Navbar.css";
import logo from '../assets/logo2.png';

const navItems = [
  { name: "יתרונות", href: "#features" },
  { name: "איך זה עובד", href: "#how-it-works" },
  { name: "המלצות", href: "#testimonials" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-menu">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="navbar-link">
                {item.name}
              </a>
            ))}
          </div>
          <div className="navbar-logo">
            <a href="/">
              <img src={logo} alt="SmartDeal" className="logo-image" />
            </a>
          </div>
          <div className="navbar-mobile-menu">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-button"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mobile-menu-items">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
