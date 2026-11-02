const { haversineDistance, getStations } = require('./stationDataService');
const { getPythonRecommendations } = require('./pythonRecommendationService');

// Popular Delhi NCR landmark coordinates for ultra-fast, 100% reliable local resolution
const LOCAL_LANDMARKS = [
  { name: 'connaught place', lat: 28.6315, lon: 77.2167, display: 'Connaught Place, Central Delhi' },
  { name: 'cp', lat: 28.6315, lon: 77.2167, display: 'Connaught Place, Central Delhi' },
  { name: 'hauz khas', lat: 28.5494, lon: 77.2001, display: 'Hauz Khas, South Delhi' },
  { name: 'nehru place', lat: 28.5491, lon: 77.2533, display: 'Nehru Place, South Delhi' },
  { name: 'okhla', lat: 28.5355, lon: 77.2750, display: 'Okhla Industrial Area, New Delhi' },
  { name: 'mohan estate', lat: 28.5188, lon: 77.2942, display: 'Mohan Cooperative Estate, Mathura Road, New Delhi' },
  { name: 'sarita vihar', lat: 28.5312, lon: 77.2930, display: 'Sarita Vihar, South Delhi' },
  { name: 'greater kailash', lat: 28.5567, lon: 77.2326, display: 'Greater Kailash, South Delhi' },
  { name: 'gk', lat: 28.5567, lon: 77.2326, display: 'Greater Kailash, South Delhi' },
  { name: 'dilli haat', lat: 28.5728, lon: 77.2087, display: 'Dilli Haat, Kidwai Nagar, New Delhi' },
  { name: 'kidwai nagar', lat: 28.5728, lon: 77.2087, display: 'West Kidwai Nagar, New Delhi' },
  { name: 'lodhi road', lat: 28.5811, lon: 77.2272, display: 'Lodhi Road, Central Delhi' },
  { name: 'dwarka', lat: 28.5920, lon: 77.0585, display: 'Dwarka Sector 6, South West Delhi' },
  { name: 'janakpuri', lat: 28.6106, lon: 77.0948, display: 'Janakpuri District Centre, West Delhi' },
  { name: 'pitampura', lat: 28.6962, lon: 77.1550, display: 'Pitampura, North West Delhi' },
  { name: 'netaji nagar', lat: 28.5792, lon: 77.1881, display: 'Netaji Nagar, New Delhi' },
  { name: 'malcha marg', lat: 28.6018, lon: 77.1864, display: 'Malcha Marg, Diplomatic Enclave, New Delhi' },
  { name: 'india gate', lat: 28.6129, lon: 77.2295, display: 'India Gate, New Delhi' },
  { name: 'noida', lat: 28.5355, lon: 77.3910, display: 'Noida, Sector 18, Uttar Pradesh' },
  { name: 'gurgaon', lat: 28.4595, lon: 77.0266, display: 'Gurugram / Cyber City, Haryana' },
  { name: 'gurugram', lat: 28.4595, lon: 77.0266, display: 'Gurugram / Cyber City, Haryana' },
  { name: 'airport', lat: 28.5562, lon: 77.1000, display: 'Indira Gandhi International Airport (DEL)' },
  { name: 'igi airport', lat: 28.5562, lon: 77.1000, display: 'IGI Airport Terminal 3, New Delhi' },
  { name: 'new delhi', lat: 28.6139, lon: 77.2090, display: 'New Delhi Railway Station Area' },
  { name: 'delhi', lat: 28.6139, lon: 77.2090, display: 'New Delhi, India' },
];

/**
 * Resolves a text query into geographic coordinates.
 */
async function geocodeLocation(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Please provide a valid location name or coordinates.');
  }

  const trimmed = query.trim();

  // 1. Direct coordinate format: "28.543, 77.257"
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return {
        latitude: lat,
        longitude: lon,
        displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        source: 'coordinates',
      };
    }
  }

  // 2. Check local landmark dictionary
  const lower = trimmed.toLowerCase();
  for (const lm of LOCAL_LANDMARKS) {
    if (lower === lm.name || lower.includes(lm.name)) {
      return {
        latitude: lm.lat,
        longitude: lm.lon,
        displayName: lm.display,
        source: 'local_database',
      };
    }
  }

  // 3. Fallback: Query OpenStreetMap Nominatim with a fast timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed + ', India'
    )}&format=json&limit=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ChargeNav-EV-Planner/1.0' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          source: 'nominatim',
        };
      }
    }
  } catch (err) {
    console.warn(`Nominatim geocode failed for "${trimmed}":`, err.message);
  }

  // 4. Default regional fallback if everything else fails (Central Delhi coordinates)
  return {
    latitude: 28.6139,
    longitude: 77.2090,
    displayName: `${trimmed} (Estimated Delhi NCR)`,
    source: 'fallback',
  };
}

/**
 * Calculates a route between two geographic points using OSRM or mathematical road model.
 */
async function calculateRoute(start, destination) {
  const geoDistance = haversineDistance(
    start.latitude,
    start.longitude,
    destination.latitude,
    destination.longitude
  );

  let roadDistance = Number((geoDistance * 1.28).toFixed(2));
  let durationMinutes = Math.max(5, Math.round((roadDistance / 35) * 60)); // ~35 km/h urban EV speed
  let waypoints = [];
  let isRoadRouteReal = false;

  // Try real road routing via Open Source Routing Machine (OSRM)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ChargeNav-EV-Planner/1.0' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primary = data.routes[0];
        roadDistance = Number((primary.distance / 1000).toFixed(2)); // meters -> km
        durationMinutes = Math.round(primary.duration / 60); // seconds -> minutes
        if (primary.geometry && primary.geometry.coordinates) {
          // OSRM coordinates are [lon, lat] -> convert to { lat, lon }
          waypoints = primary.geometry.coordinates.map((c) => ({
            latitude: c[1],
            longitude: c[0],
          }));
          isRoadRouteReal = true;
        }
      }
    }
  } catch (err) {
    console.warn('OSRM routing request failed or timed out:', err.message);
  }

  // If no OSRM waypoints, interpolate 7 steps along the route for corridor calculations
  if (waypoints.length === 0) {
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      waypoints.push({
        latitude: start.latitude + (destination.latitude - start.latitude) * frac,
        longitude: start.longitude + (destination.longitude - start.longitude) * frac,
      });
    }
  }

  return {
    roadDistanceKm: roadDistance,
    geographicalDistanceKm: Number(geoDistance.toFixed(2)),
    estimatedDurationMinutes: durationMinutes,
    isRoadRouteReal,
    waypoints,
  };
}

/**
 * Calculates perpendicular geodesic distance from a point to a line segment in km.
 */
function pointToSegmentDistanceKm(pLat, pLon, aLat, aLon, bLat, bLon) {
  const midLatRad = ((pLat + aLat + bLat) / 3) * (Math.PI / 180);
  const kx = 111.32 * Math.cos(midLatRad);
  const ky = 110.574;

  const px = (pLon - aLon) * kx;
  const py = (pLat - aLat) * ky;
  const bx = (bLon - aLon) * kx;
  const by = (bLat - aLon) * ky;

  const segLenSq = bx * bx + by * by;
  if (segLenSq === 0) return Math.sqrt(px * px + py * py);

  let t = (px * bx + py * by) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const dx = px - t * bx;
  const dy = py - t * by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the minimum distance from a coordinate point to a route polyline in km.
 */
function distanceToPolylineKm(stationLat, stationLon, waypoints) {
  if (!waypoints || waypoints.length === 0) return Infinity;
  let minD = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const d = haversineDistance(stationLat, stationLon, waypoints[i].latitude, waypoints[i].longitude);
    if (d < minD) minD = d;
    if (i < waypoints.length - 1) {
      const dSeg = pointToSegmentDistanceKm(
        stationLat,
        stationLon,
        waypoints[i].latitude,
        waypoints[i].longitude,
        waypoints[i + 1].latitude,
        waypoints[i + 1].longitude
      );
      if (dSeg < minD) minD = dSeg;
    }
  }
  return minD;
}

/**
 * Checks connector compatibility between station charger type and vehicle connector.
 */
function checkConnectorCompatibility(station, vehicleConnector) {
  if (!vehicleConnector) return { isCompatible: true, note: 'Standard EV connector' };
  const vConn = String(vehicleConnector).toUpperCase().trim();
  const sType = String(station.charger_type || station.type || '').toUpperCase();
  const sPower = String(station.power_type || '').toUpperCase();

  // CCS2 (Combined Charging System Type 2)
  if (vConn.includes('CCS')) {
    if (
      sType.includes('COMBO') ||
      sType.includes('CCS') ||
      sType.includes('T2-COMBO') ||
      (sPower === 'DC' && !sType.includes('CHADEMO'))
    ) {
      return { isCompatible: true, note: 'Directly compatible with CCS2' };
    }
    return { isCompatible: false, note: 'Requires CCS2 adapter / different plug' };
  }

  // Type 2 (AC Slow/Fast)
  if (vConn.includes('TYPE 2') || vConn.includes('TYPE2')) {
    if (
      sType.includes('AC001') ||
      sType.includes('TYPE 2') ||
      sType.includes('TYPE2') ||
      sType.includes('T2') ||
      sPower === 'AC'
    ) {
      return { isCompatible: true, note: 'Directly compatible with Type 2' };
    }
    return { isCompatible: false, note: 'AC Type 2 not supported directly' };
  }

  // CHAdeMO
  if (vConn.includes('CHADEMO')) {
    if (sType.includes('CHADEMO')) {
      return { isCompatible: true, note: 'Directly compatible with CHAdeMO' };
    }
    return { isCompatible: false, note: 'CHAdeMO plug not available' };
  }

  // GB/T
  if (vConn.includes('GB/T') || vConn.includes('GBT')) {
    if (sType.includes('GB/T') || sType.includes('GBT') || sType.includes('DC-001')) {
      return { isCompatible: true, note: 'Directly compatible with GB/T' };
    }
    return { isCompatible: false, note: 'GB/T plug not available' };
  }

  return { isCompatible: true, note: 'Standard EV compatibility' };
}

/**
 * Plans the complete EV route with compatible charging stations along the route corridor.
 * Personalizes calculations using vehicle specifications when available.
 */
async function planEVRoute({
  from,
  to,
  battery = 50,
  minSpeed = 0,
  powerType,
  vehicleType,
  corridorKm = 3,
  vehicle = null,
}) {
  // 1. Resolve start and destination locations
  const startLoc = await geocodeLocation(from);
  const destLoc = await geocodeLocation(to);

  // 2. Calculate road and geographical distance & route path
  const route = await calculateRoute(startLoc, destLoc);

  // Determine vehicle category (4W vs 2W)
  const isScooter =
    (vehicle?.vehicleType && String(vehicle.vehicleType).toLowerCase().includes('scooter')) ||
    (vehicleType && String(vehicleType).toUpperCase().includes('2W'));
  const targetVehicleCategory = isScooter ? '2W' : (vehicle || vehicleType ? '4W' : null);

  // 3. Find stations along the route corridor (distance to closest point on the road route polyline)
  const allStations = await getStations({});

  // Filter available stations that meet minimum speed and vehicle type
  const candidateStations = allStations.filter((s) => {
    if (Number(s.available) <= 0) return false;
    if (minSpeed && Number(s.capacity) < Number(minSpeed)) return false;
    if (powerType && !String(s.power_type).toLowerCase().includes(powerType.toLowerCase())) return false;
    if (vehicleType && !String(s.vehicle_type).toLowerCase().includes(vehicleType.toLowerCase())) return false;
    if (targetVehicleCategory && !String(s.vehicle_type).includes(targetVehicleCategory)) return false;
    return true;
  });

  // Calculate distance from each candidate to the road-route geometry
  const stationsWithRouteDistance = candidateStations.map((station) => {
    const minCorridorDist = distanceToPolylineKm(
      Number(station.latitude),
      Number(station.longitude),
      route.waypoints
    );
    const distFromStart = haversineDistance(
      startLoc.latitude,
      startLoc.longitude,
      Number(station.latitude),
      Number(station.longitude)
    );
    return {
      ...station,
      corridorDistance: Number(minCorridorDist.toFixed(2)),
      distanceFromStart: Number(distFromStart.toFixed(2)),
    };
  });

  // Configurable corridor threshold (defaults to 3.0 km, or user supplied)
  const userCorridor = Number(corridorKm);
  const selectedCorridorKm = !isNaN(userCorridor) && userCorridor > 0 ? userCorridor : 3.0;

  // Filter stations strictly within the route corridor
  let corridorStations = stationsWithRouteDistance.filter((s) => s.corridorDistance <= selectedCorridorKm);
  if (corridorStations.length === 0) {
    // If no stations exist within selected corridor, gracefully expand corridor up to 6 km
    const fallbackCorridor = Math.max(selectedCorridorKm * 1.5, 6.0);
    corridorStations = stationsWithRouteDistance.filter((s) => s.corridorDistance <= fallbackCorridor);
  }

  // Energy & Battery calculation personalized with vehicle specifications
  const batteryCapacity = vehicle && Number(vehicle.batteryCapacity) > 0 ? Number(vehicle.batteryCapacity) : 50;
  const rangeKm = vehicle && Number(vehicle.rangeKm) > 0 ? Number(vehicle.rangeKm) : (isScooter ? 120 : 300);
  const maxChargingSpeed = vehicle && Number(vehicle.maxChargingSpeed) > 0 ? Number(vehicle.maxChargingSpeed) : null;
  const vehicleConnector = vehicle?.connectorType || null;

  // Specific energy consumption (kWh/km)
  const consumptionRateKwhPerKm = Number((batteryCapacity / Math.max(1, rangeKm)).toFixed(4));
  const estimatedKwhUsed = Number((route.roadDistanceKm * consumptionRateKwhPerKm).toFixed(1));
  const estimatedBatteryDropPercent = Math.min(100, Math.round((estimatedKwhUsed / batteryCapacity) * 100));
  const estimatedRemainingBattery = Math.max(0, Math.round(Number(battery) - estimatedBatteryDropPercent));
  const estimatedRemainingRangeKm = Math.max(0, Math.round((estimatedRemainingBattery / 100) * rangeKm));

  // Determine if a charging stop is recommended along the journey
  const startingRangeKm = (Number(battery) / 100) * rangeKm;
  const needsChargingStop = estimatedRemainingBattery < 20 || route.roadDistanceKm > startingRangeKm * 0.85;

  // Helper to enrich a station with vehicle-specific effective speed, charging time, and connector compatibility
  const enrichStationWithVehicle = (st) => {
    const stationCapacity = Number(st.capacity || st.charging_speed || st.speed || 25);
    const effectiveSpeed = maxChargingSpeed ? Math.min(stationCapacity, maxChargingSpeed) : stationCapacity;
    const isCapped = maxChargingSpeed ? stationCapacity > maxChargingSpeed : false;

    // Calculate time to charge remaining battery to 80% SoC
    const targetSoc = 80;
    const socNeeded = Math.max(0, targetSoc - estimatedRemainingBattery);
    const kwhTo80 = (socNeeded / 100) * batteryCapacity;
    const chargingTimeMinutes = effectiveSpeed > 0 ? Math.round((kwhTo80 / (effectiveSpeed * 0.9)) * 60) : null;

    const compatibility = checkConnectorCompatibility(st, vehicleConnector);

    return {
      ...st,
      effectiveChargingSpeed: effectiveSpeed,
      vehicleMaxChargingSpeed: maxChargingSpeed,
      isCappedByVehicle: isCapped,
      estimatedChargingTimeMinutes: chargingTimeMinutes,
      isConnectorCompatible: compatibility.isCompatible,
      connectorCompatibilityNote: compatibility.note,
    };
  };

  // 4. Score corridor stations using the Python recommendation engine & 50/50 scoring
  let rankedStations = [];
  try {
    const pythonResult = await getPythonRecommendations({
      latitude: startLoc.latitude,
      longitude: startLoc.longitude,
      battery: Number(battery),
      min_charging_speed: Number(minSpeed),
      power_type: powerType,
      vehicle_type: vehicleType || targetVehicleCategory,
    });

    if (pythonResult && pythonResult.results && pythonResult.results.length > 0) {
      // Filter python recommendations to ONLY include stations inside the route corridor
      const corridorUids = new Set(corridorStations.map((s) => String(s.uid)));

      rankedStations = pythonResult.results
        .filter((pr) => corridorUids.has(String(pr.uid)))
        .map((pr) => {
          const match = corridorStations.find((s) => String(s.uid) === String(pr.uid));
          const base = {
            ...match,
            ...pr,
            isRecommended: true,
            corridorDistance: match ? match.corridorDistance : pr.distance,
            distanceFromStart: match ? match.distanceFromStart : pr.distance,
          };
          return enrichStationWithVehicle(base);
        });
    }
  } catch (pyErr) {
    console.warn('Python recommendation engine call failed, using built-in scoring fallback:', pyErr.message);
  }

  // Fallback scoring if Python engine wasn't reachable or returned no corridor stations
  if (rankedStations.length === 0 && corridorStations.length > 0) {
    const distances = corridorStations.map((s) => s.corridorDistance);
    const minD = Math.min(...distances);
    const maxD = Math.max(...distances);
    const maxS = Math.max(...corridorStations.map((s) => Number(s.capacity) || 1));

    rankedStations = corridorStations.map((s) => {
      const distScore = maxD === minD ? 1.0 : (maxD - s.corridorDistance) / (maxD - minD);
      const speedScore = (Number(s.capacity) || 0) / (maxS || 1);
      const score = 0.5 * distScore + 0.5 * speedScore;
      const base = {
        uid: s.uid,
        name: s.name,
        vendor_name: s.vendor_name,
        address: s.address,
        city: s.city,
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        distance: s.distanceFromStart,
        corridorDistance: s.corridorDistance,
        speed: s.capacity,
        charging_speed: s.capacity,
        cost_per_unit: s.cost_per_unit,
        price: s.cost_per_unit,
        available: s.available,
        availability: s.available,
        total: s.total,
        power_type: s.power_type,
        charger_type: s.type || s.charger_type,
        vehicle_type: s.vehicle_type,
        isRecommended: true,
        score: Number(score.toFixed(4)),
      };
      return enrichStationWithVehicle(base);
    });
    rankedStations.sort((a, b) => b.score - a.score);
  }

  // If vehicle connector is specified, prioritize compatible stations in recommendation order
  if (vehicleConnector) {
    rankedStations.sort((a, b) => {
      if (a.isConnectorCompatible === b.isConnectorCompatible) {
        return (b.score || 0) - (a.score || 0);
      }
      return a.isConnectorCompatible ? -1 : 1;
    });
  }

  // Build complete list of corridor stations for map view, flagging recommended ones
  const recommendedUids = new Set(rankedStations.map((s) => String(s.uid)));
  const allCorridorStations = corridorStations.map((s) => {
    const enriched = enrichStationWithVehicle(s);
    return {
      ...enriched,
      isRecommended: recommendedUids.has(String(s.uid)),
    };
  });

  const recommendedChargingStopsCount =
    rankedStations.length > 0 && needsChargingStop
      ? Math.max(1, Math.ceil(route.roadDistanceKm / (rangeKm * 0.75)))
      : 0;

  return {
    success: true,
    route: {
      origin: startLoc,
      destination: destLoc,
      roadDistanceKm: route.roadDistanceKm,
      geographicalDistanceKm: route.geographicalDistanceKm,
      estimatedDurationMinutes: route.estimatedDurationMinutes,
      isRoadRouteReal: route.isRoadRouteReal,
      waypointsCount: route.waypoints.length,
      waypoints: route.waypoints,
      sampleWaypoints: route.waypoints.slice(0, 10),
      corridorKm: selectedCorridorKm,
    },
    evMetrics: {
      startingBatteryPercent: Number(battery),
      estimatedBatteryDropPercent,
      estimatedRemainingBatteryPercent: estimatedRemainingBattery,
      estimatedEnergyKwh: estimatedKwhUsed,
      estimatedRemainingRangeKm,
      vehicleRangeKm: rangeKm,
      vehicleBatteryCapacityKwh: batteryCapacity,
      consumptionRateKwhPerKm,
      needsChargingStop,
      recommendedChargingStopsCount,
      vehicleProfile: vehicle
        ? {
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            batteryCapacity,
            rangeKm,
            vehicleType: vehicle.vehicleType || (isScooter ? 'Electric Scooter' : 'Electric Car'),
            maxChargingSpeed,
            connectorType: vehicleConnector,
            isPersonalized: true,
          }
        : null,
    },
    recommendations: rankedStations,
    corridorStations: allCorridorStations,
    totalRecommendations: rankedStations.length,
  };
}

module.exports = {
  geocodeLocation,
  calculateRoute,
  planEVRoute,
  LOCAL_LANDMARKS,
};
