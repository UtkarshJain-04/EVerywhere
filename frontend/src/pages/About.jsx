import React, { useEffect } from 'react';
import AboutHero from '../components/about/AboutHero';
import MissionVision from '../components/about/MissionVision';
import OurValues from '../components/about/OurValues';
import ImpactNumbers from '../components/about/ImpactNumbers';
import CallToActionStrip from '../components/about/CallToActionStrip';

export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <AboutHero />

      {/* Mission & Vision Section */}
      <MissionVision />

      {/* Our Values Grid */}
      <OurValues />

      {/* Our Impact Card & The Numbers Metrics */}
      <ImpactNumbers />

      {/* Be Part Of The Change Call To Action Strip */}
      <CallToActionStrip />
    </>
  );
}
