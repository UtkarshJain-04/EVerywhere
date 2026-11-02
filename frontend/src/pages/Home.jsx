import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import RouteRecommendationsSection from '../components/RouteRecommendationsSection';
import WhyChargeNav from '../components/WhyChargeNav';
import { api } from '../services/api';

export default function Home() {
  const [routeData, setRouteData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  const handleSearchRoute = async (searchParams) => {
    setLoading(true);
    setError(null);
    setLastQuery(searchParams);

    try {
      const response = await api.recommendations.planRoute(searchParams);
      if (response && response.success) {
        setRouteData(response);
        setRecommendations(response.recommendations || []);

        // Smooth scroll to recommendations section
        setTimeout(() => {
          const el = document.getElementById('recommendation-results');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        throw new Error(response?.message || 'Unable to plan route.');
      }
    } catch (err) {
      console.error('Route planning error:', err);
      setError(
        err.message || 'Unable to connect to the recommendation engine. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCorridorChange = (newCorridorKm) => {
    if (lastQuery) {
      handleSearchRoute({
        ...lastQuery,
        corridorKm: newCorridorKm,
      });
    }
  };

  return (
    <>
      {/* Hero Section with Search Form & Interactive Phone Mockup */}
      <HeroSection
        onSearchRoute={handleSearchRoute}
        loading={loading}
        routeData={routeData}
        recommendations={recommendations}
      />

      {/* Dynamic Recommendation Results Section powered by Python Recommendation Engine */}
      <RouteRecommendationsSection
        routeData={routeData}
        recommendations={recommendations}
        loading={loading}
        error={error}
        onRetry={lastQuery ? () => handleSearchRoute(lastQuery) : undefined}
        onCorridorChange={handleCorridorChange}
      />

      {/* Why ChargeNav Feature Highlights Grid */}
      <WhyChargeNav />
    </>
  );
}
