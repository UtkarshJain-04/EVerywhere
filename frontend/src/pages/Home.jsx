import React from 'react';
import HeroSection from '../components/HeroSection';
import WhyChargeNav from '../components/WhyChargeNav';

export default function Home() {
  return (
    <>
      {/* Hero Section with Route Search and Interactive Phone Mockup */}
      <HeroSection />

      {/* Why ChargeNav Feature Highlights Grid */}
      <WhyChargeNav />
    </>
  );
}
