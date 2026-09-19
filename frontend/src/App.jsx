import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhyChargeNav from './components/WhyChargeNav';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-[#0a8754] selection:text-white">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Route Search and Interactive Phone Mockup */}
        <HeroSection />

        {/* Why ChargeNav Feature Highlights Grid */}
        <WhyChargeNav />
      </main>

      {/* Scenic Footer Strip */}
      <Footer />
    </div>
  );
}
