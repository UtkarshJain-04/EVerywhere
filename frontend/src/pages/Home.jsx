import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import RouteRecommendationsSection from '../components/RouteRecommendationsSection';
import WhyChargeNav from '../components/WhyChargeNav';
import StationDetailModal from '../components/reviews/StationDetailModal';
import { api } from '../services/api';

export default function Home() {
  const [routeData, setRouteData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  // Intermediate Charging Stop state for dynamic 2-segment route integration
  const [selectedStop, setSelectedStop] = useState(null);
  const [segmentedRoute, setSegmentedRoute] = useState(null);
  const [segmentLoading, setSegmentLoading] = useState(false);

  // Active Station for Community Reviews & Details modal
  const [activeDetailStation, setActiveDetailStation] = useState(null);

  const handleSearchRoute = async (searchParams) => {
    setLoading(true);
    setError(null);
    setLastQuery(searchParams);
    // Reset any previously selected stop on new journey search
    setSelectedStop(null);
    setSegmentedRoute(null);

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

  const handleSelectStop = async (station) => {
    if (!station) return;
    setSelectedStop(station);
    setSegmentLoading(true);

    try {
      const from = routeData?.route?.origin || lastQuery?.from;
      const to = routeData?.route?.destination || lastQuery?.to;
      const battery = lastQuery?.battery || 50;
      const vehicle = lastQuery?.vehicle || routeData?.evMetrics?.vehicleProfile || undefined;

      const segResult = await api.recommendations.planRouteWithStop({
        from,
        to,
        stopStation: station,
        battery,
        vehicle,
      });

      if (segResult && segResult.success) {
        setSegmentedRoute(segResult);
      }
    } catch (segErr) {
      console.warn('Failed to calculate segmented route:', segErr.message);
    } finally {
      setSegmentLoading(false);
    }
  };

  const handleRemoveStop = () => {
    setSelectedStop(null);
    setSegmentedRoute(null);
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
        selectedStop={selectedStop}
        segmentedRoute={segmentedRoute}
        segmentLoading={segmentLoading}
        onSelectStop={handleSelectStop}
        onRemoveStop={handleRemoveStop}
        onRetry={lastQuery ? () => handleSearchRoute(lastQuery) : undefined}
        onCorridorChange={handleCorridorChange}
        onOpenStationDetails={setActiveDetailStation}
      />

      {/* Community Reviews & Ratings Station Detail Modal */}
      {activeDetailStation && (
        <StationDetailModal
          station={activeDetailStation}
          isOpen={Boolean(activeDetailStation)}
          onClose={() => setActiveDetailStation(null)}
          routeOrigin={routeData?.route?.origin}
          onAddStop={handleSelectStop}
          isCurrentStop={selectedStop?.uid === activeDetailStation?.uid}
        />
      )}

      {/* Why ChargeNav Feature Highlights Grid */}
      <WhyChargeNav />
    </>
  );
}
