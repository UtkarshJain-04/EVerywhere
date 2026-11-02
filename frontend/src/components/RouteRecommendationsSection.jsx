import React, { useState } from 'react';
import {
  Zap,
  MapPin,
  Clock,
  Compass,
  BatteryCharging,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import RouteCorridorMap from './RouteCorridorMap';

export default function RouteRecommendationsSection({
  routeData,
  recommendations = [],
  loading = false,
  error = null,
  onRetry,
  onCorridorChange,
}) {
  const [filterSpeed, setFilterSpeed] = useState('all');
  const [filterPower, setFilterPower] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'distance' | 'speed'

  if (!routeData && !loading && !error) {
    return null;
  }

  // Maximum intermediate waypoints supported in Google Maps directions Universal URL
  const MAX_MAP_WAYPOINTS = 9;

  // Filter valid station coordinates for Google Maps
  const validStations = (recommendations || []).filter(
    (s) => s && s.latitude != null && s.longitude != null
  );

  // Sort waypoints by corridor distance from start so route progression flows naturally
  const orderedWaypoints = [...validStations]
    .sort(
      (a, b) =>
        Number(a.distance || a.distanceFromStart || 0) -
        Number(b.distance || b.distanceFromStart || 0)
    )
    .slice(0, MAX_MAP_WAYPOINTS);

  const originLat = routeData?.route?.origin?.latitude;
  const originLon = routeData?.route?.origin?.longitude;
  const destLat = routeData?.route?.destination?.latitude;
  const destLon = routeData?.route?.destination?.longitude;

  const originParam =
    originLat != null && originLon != null
      ? `${originLat},${originLon}`
      : encodeURIComponent(routeData?.route?.origin?.displayName || '');

  const destParam =
    destLat != null && destLon != null
      ? `${destLat},${destLon}`
      : encodeURIComponent(routeData?.route?.destination?.displayName || '');

  const waypointsParam = orderedWaypoints
    .map((s) => `${s.latitude},${s.longitude}`)
    .join('|');

  const googleMapsUrl =
    originParam && destParam
      ? `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}${
          waypointsParam ? `&waypoints=${encodeURIComponent(waypointsParam)}` : ''
        }&travelmode=driving`
      : null;

  const hasStations = validStations.length > 0;

  // Filter recommendations
  let filtered = [...recommendations];

  if (filterSpeed !== 'all') {
    const minS = Number(filterSpeed);
    filtered = filtered.filter((s) => Number(s.charging_speed || s.speed) >= minS);
  }

  if (filterPower !== 'all') {
    filtered = filtered.filter(
      (s) => s.power_type && s.power_type.toLowerCase().includes(filterPower.toLowerCase())
    );
  }

  // Sort recommendations
  filtered.sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.distance || a.corridorDistance || 0) - (b.distance || b.corridorDistance || 0);
    }
    if (sortBy === 'speed') {
      return (Number(b.charging_speed || b.speed) || 0) - (Number(a.charging_speed || a.speed) || 0);
    }
    return (b.score || 0) - (a.score || 0);
  });

  return (
    <section id="recommendation-results" className="w-full bg-[#f8faf9] py-12 sm:py-16 border-t border-slate-200/80">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-[#0a8754] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Zap className="w-3.5 h-3.5 fill-[#0a8754]" />
              <span>Python Recommendation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0d233a] tracking-tight">
              EV Route &amp; Recommended Charging Stops
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Ranked with a balanced 50% distance score and 50% charging speed score along your route corridor.
            </p>
          </div>

          {routeData && (
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="font-semibold text-slate-700">Origin: </span>
                  <span className="text-emerald-700 font-medium">{routeData.route?.origin?.displayName?.split(',')[0]}</span>
                  <span className="mx-2 text-slate-400">→</span>
                  <span className="font-semibold text-slate-700">Destination: </span>
                  <span className="text-emerald-700 font-medium">{routeData.route?.destination?.displayName?.split(',')[0]}</span>
                </div>

                {hasStations ? (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none whitespace-nowrap"
                    title={
                      validStations.length > MAX_MAP_WAYPOINTS
                        ? `Opens Google Maps route with top ${MAX_MAP_WAYPOINTS} of ${validStations.length} recommended charging stops along corridor`
                        : `Opens Google Maps route with all ${validStations.length} recommended charging stops along corridor`
                    }
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View All Stations on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed select-none whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>No Stations to Display on Map</span>
                  </button>
                )}
              </div>

              {hasStations ? (
                <span className="text-[11px] text-slate-500 text-right">
                  {validStations.length > MAX_MAP_WAYPOINTS
                    ? `*Google Maps route displays top ${MAX_MAP_WAYPOINTS} of ${validStations.length} recommended charging stops along corridor (Google Maps waypoint limit)`
                    : `*Google Maps route displays all ${validStations.length} recommended charging stop${validStations.length === 1 ? '' : 's'} along corridor`}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 text-right">
                  No recommended charging stations found for this route corridor
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0a8754] animate-spin">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Calculating Best EV Journey...</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
                Resolving road route and executing Python recommendation engine (haversine + 50/50 scoring) on charging stations.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 bg-red-50 rounded-3xl border border-red-200 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-base font-bold text-red-900">Unable to Complete Route Planning</h3>
            <p className="text-xs sm:text-sm text-red-700 max-w-lg">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Route Search</span>
              </button>
            )}
          </div>
        )}

        {/* Results Body */}
        {routeData && !loading && !error && (
          <>
            {/* Personalized EV Profile Status Banner */}
            {routeData.evMetrics?.vehicleProfile?.isPersonalized && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-white border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#0a8754] text-white text-[10.5px] font-extrabold tracking-wide uppercase shadow-2xs">
                    Personalized EV Plan
                  </span>
                  <div>
                    <span className="font-extrabold text-[#0d233a] text-sm">
                      {routeData.evMetrics.vehicleProfile.model}
                    </span>
                    <span className="text-slate-500 font-medium ml-2">
                      ({routeData.evMetrics.vehicleProfile.batteryCapacity} kWh pack • {routeData.evMetrics.vehicleProfile.connectorType} connector • Max {routeData.evMetrics.vehicleProfile.maxChargingSpeed} kW)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-100">
                  Range &amp; chargers matched to your EV specs
                </span>
              </div>
            )}

            {/* Journey Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              
              {/* Card 1: Road Distance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0a8754] shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Road Distance</span>
                  <div className="text-2xl font-black text-[#0d233a] leading-tight">
                    {routeData.route?.roadDistanceKm} <span className="text-sm font-semibold text-slate-500">km</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Straight-line: {routeData.route?.geographicalDistanceKm} km
                  </span>
                </div>
              </div>

              {/* Card 2: Estimated Travel Time */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</span>
                  <div className="text-2xl font-black text-[#0d233a] leading-tight">
                    {routeData.route?.estimatedDurationMinutes} <span className="text-sm font-semibold text-slate-500">mins</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {routeData.route?.isRoadRouteReal ? 'Road navigation model' : 'Average urban speed model'}
                  </span>
                </div>
              </div>

              {/* Card 3: Estimated Battery Consumption */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <BatteryCharging className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Battery</span>
                  <div className="text-2xl font-black text-[#0d233a] leading-tight">
                    {routeData.evMetrics?.estimatedRemainingBatteryPercent}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Est. usage: -{routeData.evMetrics?.estimatedBatteryDropPercent}% ({routeData.evMetrics?.estimatedEnergyKwh} kWh{routeData.evMetrics?.vehicleBatteryCapacityKwh ? ` of ${routeData.evMetrics.vehicleBatteryCapacityKwh} kWh` : ''})
                  </span>
                  {routeData.evMetrics?.estimatedRemainingRangeKm != null && (
                    <span className="text-[9.5px] text-[#0a8754] font-semibold block mt-0.5">
                      Est. range remaining: ~{routeData.evMetrics.estimatedRemainingRangeKm} km
                    </span>
                  )}
                </div>
              </div>

              {/* Card 4: Recommended Stops */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compatible Stops</span>
                  <div className="text-2xl font-black text-[#0d233a] leading-tight">
                    {recommendations.length} <span className="text-sm font-semibold text-slate-500">stations</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {routeData.evMetrics?.vehicleProfile?.connectorType
                      ? `Matching ${routeData.evMetrics.vehicleProfile.connectorType}`
                      : 'Filtered & ranked by algorithm'}
                  </span>
                </div>
              </div>

            </div>

            {/* Interactive Route Corridor Map (PlugShare style) */}
            <RouteCorridorMap
              routeData={routeData}
              recommendations={recommendations}
              corridorStations={routeData.corridorStations || recommendations}
              activeCorridorKm={routeData.route?.corridorKm || 3}
              onCorridorChange={onCorridorChange}
            />

            {/* Filter and Sorting Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <SlidersHorizontal className="w-4 h-4 text-[#0a8754]" />
                  <span>Filter Chargers:</span>
                </div>

                {/* Min Speed Filter */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="px-2 text-slate-500 text-[11px] font-medium">Speed:</span>
                  {[
                    { label: 'All', value: 'all' },
                    { label: '≥ 15 kW', value: '15' },
                    { label: '≥ 25 kW', value: '25' },
                    { label: '30 kW', value: '30' },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFilterSpeed(btn.value)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        filterSpeed === btn.value
                          ? 'bg-[#0a8754] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Power Type Filter */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="px-2 text-slate-500 text-[11px] font-medium">Type:</span>
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'DC Fast', value: 'DC' },
                    { label: 'AC Standard', value: 'AC' },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFilterPower(btn.value)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        filterPower === btn.value
                          ? 'bg-[#0a8754] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                >
                  <option value="score">Recommendation Match Score (50/50)</option>
                  <option value="distance">Proximity (Nearest First)</option>
                  <option value="speed">Charging Speed (Fastest First)</option>
                </select>
              </div>
            </div>

            {/* Recommendations Grid */}
            {filtered.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Charging Stations Match These Filters</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try selecting "All" speeds or adjusting your minimum charger speed requirement.
                </p>
                <button
                  onClick={() => {
                    setFilterSpeed('all');
                    setFilterPower('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((station, index) => {
                  const matchPercent = Math.round((station.score || 0) * 100);
                  const isTopMatch = index === 0 && sortBy === 'score';
                  const distanceKm = Number(station.distance || station.corridorDistance || 0).toFixed(1);

                  return (
                    <div
                      key={station.uid || index}
                      className={`relative bg-white rounded-2xl sm:rounded-3xl p-5 border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                        isTopMatch
                          ? 'border-[#0a8754] ring-2 ring-[#0a8754]/15 shadow-md shadow-emerald-700/5'
                          : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            {isTopMatch ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#0a8754] text-white text-[10.5px] font-bold tracking-wide uppercase shadow-2xs">
                                #1 Top Recommended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-bold">
                                #{index + 1}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                              {matchPercent}% Match
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                station.available > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {station.available > 0
                                ? `${station.available} Plugs Available`
                                : '0 Available'}
                            </span>
                          </div>
                        </div>

                        {/* Station Name & Vendor */}
                        <div className="mb-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-[#0d233a] leading-tight">
                            {station.name}
                          </h3>
                          <span className="text-xs font-semibold text-[#0a8754] tracking-tight">
                            {station.vendor_name || 'ChargeNav Network'}
                          </span>
                        </div>

                        {/* Address */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {station.address}
                        </p>

                        {/* Key Specs Pills */}
                        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 mb-3 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Capacity</span>
                            <span className="font-bold text-slate-800">
                              {station.charging_speed || station.speed} kW ({station.power_type || 'DC'})
                            </span>
                            {station.isCappedByVehicle && (
                              <span className="text-[9.5px] text-amber-600 font-semibold block leading-tight">
                                Capped at {station.vehicleMaxChargingSpeed} kW by EV
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Distance</span>
                            <span className="font-bold text-slate-800">
                              {distanceKm} km away
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Connector</span>
                            <span className="font-semibold text-slate-700 truncate block">
                              {station.charger_type || 'Standard'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Price / Unit</span>
                            <span className="font-semibold text-slate-700">
                              {station.cost_per_unit || station.price || 'Standard Tariffs'}
                            </span>
                          </div>
                        </div>

                        {/* Connector Compatibility & Charging Time Highlights */}
                        {station.isConnectorCompatible !== undefined && (
                          <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-[10.5px]">
                            <span
                              className={`font-bold flex items-center gap-1 ${
                                station.isConnectorCompatible
                                  ? 'text-[#0a8754]'
                                  : 'text-amber-700'
                              }`}
                            >
                              {station.isConnectorCompatible
                                ? '✓ Connector Compatible'
                                : '⚠ Adapter Recommended'}
                            </span>
                            {station.estimatedChargingTimeMinutes > 0 && (
                              <span className="font-semibold text-slate-500">
                                ~{station.estimatedChargingTimeMinutes}m to 80%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="text-[11px] text-slate-500">
                          Total plugs: <span className="font-semibold text-slate-700">{station.total || 2}</span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0a8754] text-slate-700 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
