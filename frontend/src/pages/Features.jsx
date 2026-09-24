import React, { useEffect } from 'react';
import FeaturesHero from '../components/features/FeaturesHero';
import FeatureCardsSection from '../components/features/FeatureCardsSection';
import MoreThanJustAMap from '../components/features/MoreThanJustAMap';

export default function Features() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Features - ChargeNav | Smart Routes. Charged Journeys.';
  }, []);

  return (
    <>
      {/* 1. Hero Section with Scenic EV Highway & Value Proposition */}
      <FeaturesHero />

      {/* 2. Six Rich Feature Cards Grid */}
      <FeatureCardsSection />

      {/* 3. Why ChargeNav - More Than Just a Map Section with CTA */}
      <MoreThanJustAMap />
    </>
  );
}
