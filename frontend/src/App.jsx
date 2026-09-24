import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-[#0a8754] selection:text-white">
        {/* Persistent Navigation Bar with Active State */}
        <Navbar />

        {/* Main Routed Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Persistent Scenic Footer Strip */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
