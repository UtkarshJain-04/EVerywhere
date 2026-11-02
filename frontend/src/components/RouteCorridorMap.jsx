import React, { useEffect, useRef, useState } from 'react';
import L from '../leafletLoader';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapPin, Zap, Maximize2, Filter, Compass, ExternalLink } from 'lucide-react';

/**
 * Creates a PlugShare-style teardrop SVG pin marker.
 * - Recommended / Top Pick: Emerald Green (#16a34a)
 * - Corridor stations: Warm Amber/Orange (#ea580c)
 * - Includes compact power badge (e.g. 26 kW) above the pin
 */
function createPlugSharePinIcon(station, isRecommended) {
  const speedKw = station.charging_speed || station.speed || station.capacity || 25;
  const pinColor = isRecommended ? '#16a34a' : '#ea580c';
  const badgeBg = isRecommended ? '#064e3b' : '#1e293b';
  const label = isRecommended ? `★ ${speedKw} kW` : `${speedKw} kW`;

  const markerHtml = `
    <div class="plugshare-pin-wrapper" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      user-select: none;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.32));
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    " onmouseover="this.style.transform='scale(1.15) translateY(-3px)'" onmouseout="this.style.transform='scale(1) translateY(0)'">
      
      <!-- Power Capacity Badge Pill -->
      <div style="
        background: ${badgeBg};
        color: #ffffff;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 5.5px;
        border-radius: 9999px;
        margin-bottom: -5px;
        z-index: 10;
        border: 1.5px solid #ffffff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        white-space: nowrap;
        letter-spacing: 0.2px;
      ">
        ${label}
      </div>

      <!-- PlugShare Teardrop Pin SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="30" height="39">
        <!-- Pin Teardrop Shape -->
        <path d="M16 1C7.716 1 1 7.716 1 16c0 10.8 15 25 15 25s15-14.2 15-25c0-8.284-6.716-15-15-15z" 
              fill="${pinColor}" 
              stroke="#ffffff" 
              stroke-width="1.8" />
        
        <!-- White EV Dispenser Body -->
        <rect x="11.5" y="9.5" width="7" height="9.5" rx="1.2" fill="#ffffff" />
        <rect x="10.5" y="19" width="9" height="1.2" rx="0.4" fill="#ffffff" />
        <!-- Dispenser Meter Screen cutout -->
        <rect x="12.8" y="11" width="4.4" height="3" rx="0.4" fill="${pinColor}" />
        <!-- Dispenser Hose and Nozzle -->
        <path d="M18.5 11h1.2a1 1 0 0 1 1 1v3.2a0.8 0.8 0 0 0 0.8 0.8" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
        <rect x="21" y="13.5" width="1.6" height="2.8" rx="0.4" fill="#ffffff" />
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-plugshare-pin',
    html: markerHtml,
    iconSize: [46, 50],
    iconAnchor: [23, 50],
    popupAnchor: [0, -48],
  });
}

/**
 * Creates distinct journey endpoint markers (A for start, B for destination)
 */
function createEndpointIcon(label, bgColor) {
  return L.divIcon({
    className: `custom-endpoint-${label.toLowerCase()}`,
    html: `
      <div style="
        background: ${bgColor};
        color: #ffffff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 13.5px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.38);
        cursor: pointer;
      ">
        ${label}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

export default function RouteCorridorMap({
  routeData,
  recommendations = [],
  corridorStations = [],
  activeCorridorKm = 3,
  onCorridorChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const stationClusterGroupRef = useRef(null);

  // Available corridor radius filter options
  const corridorOptions = [
    { label: 'Tight (2 km)', value: 2 },
    { label: 'Standard (3 km)', value: 3 },
    { label: 'Wide (5 km)', value: 5 },
  ];

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Use Delhi NCR coordinates as default center before route loads
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Official OpenStreetMap standard road-map tiles:
    // - Free, zero watermarks, visible roads, national highways & city names (identical to Reference Image 1)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Group for route polylines and endpoints
    const routeGroup = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = routeGroup;

    // Group for charging station markers (with clustering to prevent overlaps when stations are adjacent)
    const clusterGroup =
      typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({
            maxClusterRadius: 32, // Tightly clustered only when pins physically overlap (< 32px)
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderLegPolylineOptions: { weight: 1.5, color: '#0a8754', opacity: 0.8 },
            iconCreateFunction: function (cluster) {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `
                  <div style="
                    background: #ea580c;
                    color: #ffffff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 13px;
                    border: 2.5px solid white;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    ${count}
                  </div>
                `,
                className: 'custom-ev-cluster',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });
            },
          })
        : L.layerGroup();

    clusterGroup.addTo(map);
    stationClusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      routeLayerGroupRef.current = null;
      stationClusterGroupRef.current = null;
    };
  }, []);

  // Update map polyline, markers, and bounds whenever route or stations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    const clusterGroup = stationClusterGroupRef.current;
    if (!map || !routeGroup || !clusterGroup || !routeData) return;

    // Clear previous search markers and routes completely
    routeGroup.clearLayers();
    clusterGroup.clearLayers();

    const origin = routeData.route?.origin;
    const destination = routeData.route?.destination;
    const waypoints = routeData.route?.waypoints || [];

    // 1. Draw Road Route Polyline (clean navigation blue)
    const polylineCoords = waypoints.map((pt) => [pt.latitude, pt.longitude]);
    if (polylineCoords.length > 0) {
      L.polyline(polylineCoords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.88,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(routeGroup);
    }

    // 2. Journey Start Marker (Origin A)
    if (origin && origin.latitude != null && origin.longitude != null) {
      const originIcon = createEndpointIcon('A', '#0a8754');
      L.marker([origin.latitude, origin.longitude], { icon: originIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.35;">
            <div style="font-weight: 800; color: #0a8754; margin-bottom: 2px;">STARTING POINT (A)</div>
            <div style="font-weight: 600; color: #0d233a;">${origin.displayName || 'Origin'}</div>
          </div>
        `)
        .addTo(routeGroup);
    }

    // 3. Journey End Marker (Destination B)
    if (destination && destination.latitude != null && destination.longitude != null) {
      const destIcon = createEndpointIcon('B', '#e11d48');
      L.marker([destination.latitude, destination.longitude], { icon: destIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.35;">
            <div style="font-weight: 800; color: #e11d48; margin-bottom: 2px;">DESTINATION (B)</div>
            <div style="font-weight: 600; color: #0d233a;">${destination.displayName || 'Destination'}</div>
          </div>
        `)
        .addTo(routeGroup);
    }

    // 4. Stations along the route corridor
    const stationsPool =
      corridorStations && corridorStations.length > 0 ? corridorStations : recommendations;

    const recommendedIds = new Set(recommendations.map((r) => String(r.uid)));

    // Track coordinates to apply slight micro-offset for identical duplicate coordinates
    const seenCoords = new Map();

    stationsPool.forEach((station) => {
      if (station.latitude == null || station.longitude == null) return;

      let lat = Number(station.latitude);
      let lng = Number(station.longitude);
      const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (seenCoords.has(coordKey)) {
        const count = seenCoords.get(coordKey);
        seenCoords.set(coordKey, count + 1);
        // Micro-offset (~15 meters) so multiple chargers at the same address never completely hide each other
        lat += (count % 2 === 0 ? 0.00014 : -0.00014) * Math.ceil(count / 2);
        lng += (count % 2 === 1 ? 0.00014 : -0.00014) * Math.ceil(count / 2);
      } else {
        seenCoords.set(coordKey, 1);
      }

      const isRecommended = station.isRecommended || recommendedIds.has(String(station.uid));
      const speedKw = station.charging_speed || station.speed || station.capacity || 25;
      const isAvailable = Number(station.available) > 0;

      // Create PlugShare-style teardrop pin
      const icon = createPlugSharePinIcon(station, isRecommended);

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 240px; max-width: 290px; line-height: 1.4; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 3px;">
            <div style="font-weight: 800; font-size: 13.5px; color: #0d233a;">${station.name}</div>
            ${
              isRecommended
                ? '<span style="background: #eaf6ee; color: #0a8754; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 6px; text-transform: uppercase; shrink: 0;">Top Pick</span>'
                : '<span style="background: #fff7ed; color: #ea580c; font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 6px; shrink: 0;">On Route</span>'
            }
          </div>

          <div style="color: #0a8754; font-weight: 700; font-size: 11px; margin-bottom: 4px;">
            ${station.vendor_name || 'ChargeNav Network'}
          </div>

          <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">
            ${station.address}
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px;">
            <div><span style="color: #64748b;">Capacity:</span> <strong>${speedKw} kW</strong> (${station.power_type || 'DC'})</div>
            <div><span style="color: #64748b;">Connector:</span> <strong>${station.charger_type || 'Standard'}</strong></div>
            <div><span style="color: #64748b;">Availability:</span> <strong style="color: ${isAvailable ? '#16a34a' : '#dc2626'}">${isAvailable ? `${station.available} Plugs` : '0 Plugs'}</strong></div>
            <div><span style="color: #64748b;">Tariff:</span> <strong>${station.cost_per_unit || station.price || 'Standard Rates'}</strong></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 8px; color: #475569;">
            <span>Route Offset: <strong>${station.corridorDistance != null ? `${station.corridorDistance} km` : 'Along route'}</strong></span>
            ${station.distance != null ? `<span>From start: <strong>${station.distance} km</strong></span>` : ''}
          </div>

          <a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank" rel="noopener noreferrer" style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: #0a8754;
            color: white;
            padding: 6.5px 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 11px;
            text-decoration: none;
            transition: background 0.2s;
          ">
            <span>Open Individual Charger in Maps</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      `;

      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isRecommended ? 1000 : 100,
      }).bindPopup(popupHtml);

      clusterGroup.addLayer(marker);
    });

    // 5. Automatically adjust map bounds to display route & corridor stations together
    const boundPoints = [
      ...(origin && origin.latitude != null ? [[origin.latitude, origin.longitude]] : []),
      ...(destination && destination.latitude != null ? [[destination.latitude, destination.longitude]] : []),
      ...polylineCoords,
      ...stationsPool.filter((s) => s.latitude != null).map((s) => [s.latitude, s.longitude]),
    ];

    if (boundPoints.length > 0) {
      const bounds = L.latLngBounds(boundPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }
  }, [routeData, recommendations, corridorStations]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map || !routeData) return;
    const waypoints = routeData.route?.waypoints || [];
    const polylineCoords = waypoints.map((pt) => [pt.latitude, pt.longitude]);
    const stationsPool =
      corridorStations && corridorStations.length > 0 ? corridorStations : recommendations;

    const boundPoints = [
      ...polylineCoords,
      ...stationsPool.filter((s) => s.latitude != null).map((s) => [s.latitude, s.longitude]),
    ];

    if (boundPoints.length > 0) {
      const bounds = L.latLngBounds(boundPoints);
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  };

  const currentCorridor = routeData?.route?.corridorKm || activeCorridorKm || 3;
  const stationsCount = (corridorStations && corridorStations.length > 0 ? corridorStations : recommendations).length;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Map Interactive Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a8754] animate-pulse"></span>
            <span className="text-xs font-bold text-[#0d233a] uppercase tracking-wider">
              Route Corridor Interactive Map
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Corridor Radius Configuration Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-[#0a8754]" />
            <span className="text-[11px] font-semibold text-slate-500">Corridor:</span>
            {corridorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onCorridorChange && onCorridorChange(opt.value)}
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                  currentCorridor === opt.value
                    ? 'bg-[#0a8754] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend and Re-center action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
              <span className="font-semibold text-slate-700">Top Pick</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
              <span className="font-medium text-slate-700">On Corridor</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-sm bg-[#2563eb]"></span>
              <span className="font-medium text-slate-700">Road Route</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
            title="Recenter map to route"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Fit Route</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[440px] lg:h-[480px] bg-slate-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Bottom Left Summary Overlay Pill */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs text-slate-700 flex items-center gap-2 pointer-events-none select-none">
          <MapPin className="w-3.5 h-3.5 text-[#0a8754]" />
          <span>
            Showing <strong>{stationsCount}</strong> charging stations within <strong>{currentCorridor} km</strong> route corridor
          </span>
        </div>
      </div>
    </div>
  );
}
