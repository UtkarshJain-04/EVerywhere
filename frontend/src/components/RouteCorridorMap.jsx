import React, { useEffect, useRef, useState } from 'react';
import L from '../leafletLoader';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { api } from '../services/api';
import {
  MapPin,
  Zap,
  Maximize2,
  Filter,
  Compass,
  ExternalLink,
  Navigation,
  CheckCircle2,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowRight,
  X,
  BatteryCharging,
} from 'lucide-react';

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
        <path d="M16 1C7.716 1 1 7.716 1 16c0 10.8 15 25 15 25s15-14.2 15-25c0-8.284-6.716-15-15-15z" 
              fill="${pinColor}" 
              stroke="#ffffff" 
              stroke-width="1.8" />
        <rect x="11.5" y="9.5" width="7" height="9.5" rx="1.2" fill="#ffffff" />
        <rect x="10.5" y="19" width="9" height="1.2" rx="0.4" fill="#ffffff" />
        <rect x="12.8" y="11" width="4.4" height="3" rx="0.4" fill="${pinColor}" />
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
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 14px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.38);
        cursor: pointer;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

/**
 * Creates a prominent glowing intermediate charging stop pin
 */
function createIntermediateStopIcon(station) {
  const speedKw = station.charging_speed || station.speed || station.capacity || 25;
  const markerHtml = `
    <div class="active-charging-stop-wrapper" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      user-select: none;
      filter: drop-shadow(0 4px 14px rgba(217,119,6,0.85));
      transform: scale(1.2);
    ">
      <!-- Stop 1 Badge Pill -->
      <div style="
        background: #0d233a;
        color: #ffffff;
        font-size: 9.5px;
        font-weight: 900;
        padding: 2.5px 8px;
        border-radius: 9999px;
        margin-bottom: -5px;
        z-index: 20;
        border: 2px solid #f59e0b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        white-space: nowrap;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span style="color: #f59e0b;">⚡ STOP 1:</span>
        <span>${speedKw} kW</span>
      </div>

      <!-- Golden Amber Glowing Teardrop Pin -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="36" height="46">
        <path d="M16 1C7.716 1 1 7.716 1 16c0 10.8 15 25 15 25s15-14.2 15-25c0-8.284-6.716-15-15-15z" 
              fill="#d97706" 
              stroke="#ffffff" 
              stroke-width="2.4" />
        <rect x="11.5" y="9.5" width="7" height="9.5" rx="1.2" fill="#ffffff" />
        <rect x="10.5" y="19" width="9" height="1.2" rx="0.4" fill="#ffffff" />
        <rect x="12.8" y="11" width="4.4" height="3" rx="0.4" fill="#d97706" />
        <path d="M18.5 11h1.2a1 1 0 0 1 1 1v3.2a0.8 0.8 0 0 0 0.8 0.8" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
        <rect x="21" y="13.5" width="1.6" height="2.8" rx="0.4" fill="#ffffff" />
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-stop-pin',
    html: markerHtml,
    iconSize: [54, 58],
    iconAnchor: [27, 58],
    popupAnchor: [0, -56],
  });
}

export default function RouteCorridorMap({
  routeData,
  recommendations = [],
  corridorStations = [],
  activeCorridorKm = 3,
  onCorridorChange,
  selectedStop = null,
  segmentedRoute = null,
  segmentLoading = false,
  onSelectStop,
  onRemoveStop,
  onOpenStationDetails = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const stationClusterGroupRef = useRef(null);

  // Local state for charging completed workflow toggle
  const [chargingDone, setChargingDone] = useState(false);

  // Reset charging status whenever a different stop is selected
  useEffect(() => {
    setChargingDone(false);
  }, [selectedStop?.uid]);

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

    // 100% Free OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    routeLayerGroupRef.current = L.layerGroup().addTo(map);

    const clusterGroup =
      typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 40,
            spiderfyOnMaxZoom: true,
            iconCreateFunction: (cluster) => {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `
                  <div style="
                    background: #0a8754;
                    color: white;
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

  // Update map polylines, markers, and bounds whenever route, stations, or selected stop changes
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
    const directWaypoints = routeData.route?.waypoints || [];

    const originLat = origin?.latitude;
    const originLon = origin?.longitude;
    const originName = origin?.displayName || '';
    const destLat = destination?.latitude;
    const destLon = destination?.longitude;
    const destName = destination?.displayName || '';

    // Parameters for Google Maps directions
    const originParam =
      originLat != null && originLon != null
        ? `${originLat},${originLon}`
        : encodeURIComponent(originName);

    const destParam =
      destLat != null && destLon != null
        ? `${destLat},${destLon}`
        : encodeURIComponent(destName);

    // Stations pool
    const stationsPool =
      corridorStations && corridorStations.length > 0 ? corridorStations : recommendations;
    const recommendedIds = new Set(recommendations.map((r) => String(r.uid)));

    let boundPoints = [];

    // ==============================================================
    // 1. ROUTE POLYLINES (Dynamic 2-segment route if stop is selected)
    // ==============================================================
    if (segmentedRoute?.hasStop && segmentedRoute.segment1 && segmentedRoute.segment2) {
      // SEGMENT 1: Source -> Selected Charging Station (Vibrant Royal Blue)
      const seg1Coords = (segmentedRoute.segment1.waypoints || []).map((pt) => [pt.latitude, pt.longitude]);
      if (seg1Coords.length > 0) {
        L.polyline(seg1Coords, {
          color: '#2563eb', // Royal Blue for Leg 1
          weight: 6,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(routeGroup);
      }

      // SEGMENT 2: Selected Charging Station -> Final Destination (Vibrant Emerald/Teal)
      const seg2Coords = (segmentedRoute.segment2.waypoints || []).map((pt) => [pt.latitude, pt.longitude]);
      if (seg2Coords.length > 0) {
        L.polyline(seg2Coords, {
          color: '#059669', // Emerald/Teal for Leg 2
          weight: 6,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(routeGroup);
      }

      boundPoints = [
        ...seg1Coords,
        ...seg2Coords,
        ...(origin && origin.latitude != null ? [[origin.latitude, origin.longitude]] : []),
        ...(destination && destination.latitude != null ? [[destination.latitude, destination.longitude]] : []),
        ...(selectedStop ? [[selectedStop.latitude, selectedStop.longitude]] : []),
      ];
    } else {
      // DIRECT ROUTE: Source -> Destination (Standard Navigation Blue)
      const directCoords = directWaypoints.map((pt) => [pt.latitude, pt.longitude]);
      if (directCoords.length > 0) {
        L.polyline(directCoords, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.88,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(routeGroup);
      }

      boundPoints = [
        ...directCoords,
        ...(origin && origin.latitude != null ? [[origin.latitude, origin.longitude]] : []),
        ...(destination && destination.latitude != null ? [[destination.latitude, destination.longitude]] : []),
      ];
    }

    // ==============================================================
    // 2. ENDPOINT MARKERS (A for Origin, B for Destination)
    // ==============================================================
    if (origin && origin.latitude != null && origin.longitude != null) {
      const originIcon = createEndpointIcon('A', '#0a8754');
      L.marker([origin.latitude, origin.longitude], { icon: originIcon, zIndexOffset: 1500 })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.35;">
            <div style="font-weight: 800; color: #0a8754; margin-bottom: 2px;">STARTING POINT (A)</div>
            <div style="font-weight: 700; color: #0d233a;">${origin.displayName || 'Origin'}</div>
          </div>
        `)
        .addTo(routeGroup);
    }

    if (destination && destination.latitude != null && destination.longitude != null) {
      const destIcon = createEndpointIcon('B', '#e11d48');
      L.marker([destination.latitude, destination.longitude], { icon: destIcon, zIndexOffset: 1500 })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.35;">
            <div style="font-weight: 800; color: #e11d48; margin-bottom: 2px;">FINAL DESTINATION (B)</div>
            <div style="font-weight: 700; color: #0d233a;">${destination.displayName || 'Destination'}</div>
          </div>
        `)
        .addTo(routeGroup);
    }

    // ==============================================================
    // 3. CHARGING STATION MARKERS (PlugShare pins & Active Stop Pin)
    // ==============================================================
    const seenCoords = new Map();

    stationsPool.forEach((station) => {
      if (station.latitude == null || station.longitude == null) return;

      let lat = Number(station.latitude);
      let lng = Number(station.longitude);
      const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (seenCoords.has(coordKey)) {
        const count = seenCoords.get(coordKey);
        seenCoords.set(coordKey, count + 1);
        lat += (count % 2 === 0 ? 0.00014 : -0.00014) * Math.ceil(count / 2);
        lng += (count % 2 === 1 ? 0.00014 : -0.00014) * Math.ceil(count / 2);
      } else {
        seenCoords.set(coordKey, 1);
      }

      const isCurrentStop = selectedStop && String(selectedStop.uid) === String(station.uid);
      const isRecommended = station.isRecommended || recommendedIds.has(String(station.uid));
      const speedKw = station.charging_speed || station.speed || station.capacity || 25;
      const isAvailable = Number(station.available) > 0;

      // Choose icon: if this station is the active intermediate stop, use golden stop pin!
      const icon = isCurrentStop
        ? createIntermediateStopIcon(station)
        : createPlugSharePinIcon(station, isRecommended);

      // Google Maps navigation URLs with exact user-entered source coordinates:
      const navToStationFromSourceUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${lat},${lng}&travelmode=driving`;
      const navFullJourneyWithStopUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&waypoints=${lat},${lng}&travelmode=driving`;
      const navToDestFromStationUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destParam}&travelmode=driving`;

      const originShortName = origin?.displayName?.split(',')[0] || 'Source';

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 250px; max-width: 300px; line-height: 1.4; color: #1e293b;">
          
          ${
            isCurrentStop
              ? `
              <div style="background: #fef3c7; border: 1.5px solid #f59e0b; color: #b45309; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 10.5px; margin-bottom: 8px; text-align: center; display: flex; items-center; justify-content: center; gap: 4px;">
                <span>⚡ ACTIVE CHARGING STOP ON YOUR ROUTE</span>
              </div>
              `
              : ''
          }

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

          ${
            station.isConnectorCompatible !== undefined
              ? `
            <div style="margin-bottom: 8px; padding: 4px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; background: ${
              station.isConnectorCompatible ? '#eaf6ee' : '#fef3c7'
            }; color: ${station.isConnectorCompatible ? '#0a8754' : '#b45309'}; display: flex; align-items: center; justify-content: space-between;">
              <span>${station.isConnectorCompatible ? '✓ Matches Your EV Connector' : '⚠ Adapter Recommended'}</span>
              ${
                station.estimatedChargingTimeMinutes > 0
                  ? `<span>~${station.estimatedChargingTimeMinutes}m to 80%</span>`
                  : ''
              }
            </div>
            `
              : ''
          }

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 10px; color: #475569;">
            <span>Route Offset: <strong>${station.corridorDistance != null ? `${station.corridorDistance} km` : 'Along route'}</strong></span>
            ${station.distance != null ? `<span>From start: <strong>${station.distance} km</strong></span>` : ''}
          </div>

          <!-- Interactive Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${
              isCurrentStop
                ? `
                <a href="${navFullJourneyWithStopUrl}" target="_blank" rel="noopener noreferrer" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #0a8754;
                  color: white;
                  width: 100%;
                  padding: 7px 10px;
                  border-radius: 8px;
                  font-weight: 800;
                  font-size: 11px;
                  text-decoration: none;
                  box-shadow: 0 2px 5px rgba(10,135,84,0.3);
                ">
                  <span>Open Full Journey in Google Maps</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <a href="${navToStationFromSourceUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    background: #2563eb;
                    color: white;
                    padding: 6px 8px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 10.5px;
                    text-decoration: none;
                    text-align: center;
                  ">
                    <span>Navigate Leg 1</span>
                  </a>

                  <a href="${navToDestFromStationUrl}" target="_blank" rel="noopener noreferrer" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    background: #059669;
                    color: white;
                    padding: 6px 8px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 10.5px;
                    text-decoration: none;
                    text-align: center;
                  ">
                    <span>Continue Leg 2</span>
                  </a>
                </div>

                <button type="button" data-action="remove-stop" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #ef4444;
                  color: white;
                  width: 100%;
                  padding: 6px 10px;
                  border-radius: 8px;
                  font-weight: 800;
                  font-size: 11px;
                  border: none;
                  cursor: pointer;
                  box-shadow: 0 2px 5px rgba(239,68,68,0.3);
                  transition: background 0.2s;
                ">
                  <span>✕ Remove Stop (Restore Direct Route)</span>
                </button>

                <button type="button" data-action="view-reviews" data-station-uid="${station.uid}" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #f8fafc;
                  color: #0f172a;
                  padding: 6px 10px;
                  border-radius: 8px;
                  font-weight: 700;
                  font-size: 11px;
                  border: 1px solid #cbd5e1;
                  cursor: pointer;
                  transition: background 0.2s;
                ">
                  <span style="color: #f59e0b;">★</span>
                  <span>Community Reviews &amp; Photos</span>
                </button>
                `
                : `
                <button type="button" data-action="add-stop" data-station-uid="${station.uid}" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #0a8754;
                  color: white;
                  width: 100%;
                  padding: 7px 10px;
                  border-radius: 8px;
                  font-weight: 800;
                  font-size: 11.5px;
                  border: none;
                  cursor: pointer;
                  box-shadow: 0 2px 5px rgba(10,135,84,0.3);
                  transition: background 0.2s;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>${selectedStop ? 'Switch to this Charging Stop' : 'Add to Journey as Charging Stop'}</span>
                </button>

                <a href="${navToStationFromSourceUrl}" target="_blank" rel="noopener noreferrer" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  background: #f1f5f9;
                  color: #334155;
                  padding: 6px 10px;
                  border-radius: 8px;
                  font-weight: 700;
                  font-size: 11px;
                  text-decoration: none;
                  border: 1px solid #cbd5e1;
                  transition: background 0.2s;
                " title="Open Google Maps directions from ${originShortName} to this station">
                  <span>Navigate to Station (from ${originShortName})</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>

                <button type="button" data-action="view-reviews" data-station-uid="${station.uid}" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #f8fafc;
                  color: #0f172a;
                  padding: 6px 10px;
                  border-radius: 8px;
                  font-weight: 700;
                  font-size: 11px;
                  border: 1px solid #cbd5e1;
                  cursor: pointer;
                  transition: background 0.2s;
                ">
                  <span style="color: #f59e0b;">★</span>
                  <span>Community Reviews &amp; Photos</span>
                </button>
                `
            }
          </div>
        </div>
      `;

      if (isCurrentStop) {
        // Active stop is drawn directly on routeGroup with high zIndex so it is never clustered!
        const stopMarker = L.marker([lat, lng], {
          icon,
          zIndexOffset: 3000,
        }).bindPopup(popupHtml);
        stopMarker.addTo(routeGroup);
      } else {
        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: isRecommended ? 1000 : 100,
        }).bindPopup(popupHtml);
        clusterGroup.addLayer(marker);
      }
    });

    // Wire up Leaflet popup event listener for interactive stop selection & removal
    const handlePopupOpen = (e) => {
      const container = e.popup?.getElement();
      if (!container) return;

      const addBtn = container.querySelector('[data-action="add-stop"]');
      if (addBtn) {
        addBtn.onclick = (ev) => {
          ev.preventDefault();
          const uid = addBtn.getAttribute('data-station-uid');
          const st = stationsPool.find((s) => String(s.uid) === String(uid));
          if (st && onSelectStop) {
            onSelectStop(st);
            map.closePopup();
          }
        };
      }

      const removeBtn = container.querySelector('[data-action="remove-stop"]');
      if (removeBtn) {
        removeBtn.onclick = (ev) => {
          ev.preventDefault();
          if (onRemoveStop) {
            onRemoveStop();
            map.closePopup();
          }
        };
      }

      const reviewsBtn = container.querySelector('[data-action="view-reviews"]');
      if (reviewsBtn) {
        reviewsBtn.onclick = (ev) => {
          ev.preventDefault();
          const uid = reviewsBtn.getAttribute('data-station-uid');
          const st = stationsPool.find((s) => String(s.uid) === String(uid));
          if (st && onOpenStationDetails) {
            onOpenStationDetails(st);
            map.closePopup();
          }
        };
      }
    };

    map.on('popupopen', handlePopupOpen);

    // Auto-fit bounds
    if (boundPoints.length > 0) {
      const bounds = L.latLngBounds(boundPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }

    return () => {
      map.off('popupopen', handlePopupOpen);
    };
  }, [routeData, recommendations, corridorStations, selectedStop, segmentedRoute, onOpenStationDetails]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map || !routeData) return;

    let points = [];
    if (segmentedRoute?.hasStop && segmentedRoute.segment1 && segmentedRoute.segment2) {
      points = [
        ...(segmentedRoute.segment1.waypoints || []).map((pt) => [pt.latitude, pt.longitude]),
        ...(segmentedRoute.segment2.waypoints || []).map((pt) => [pt.latitude, pt.longitude]),
      ];
    } else {
      const waypoints = routeData.route?.waypoints || [];
      points = waypoints.map((pt) => [pt.latitude, pt.longitude]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  };

  const currentCorridor = routeData?.route?.corridorKm || activeCorridorKm || 3;
  const stationsCount = (corridorStations && corridorStations.length > 0 ? corridorStations : recommendations).length;

  const originLat = routeData?.route?.origin?.latitude;
  const originLon = routeData?.route?.origin?.longitude;
  const originName = routeData?.route?.origin?.displayName || '';

  const destLat = routeData?.route?.destination?.latitude;
  const destLon = routeData?.route?.destination?.longitude;
  const destName = routeData?.route?.destination?.displayName || '';

  const originParam =
    originLat != null && originLon != null
      ? `${originLat},${originLon}`
      : encodeURIComponent(originName);

  const destParam =
    destLat != null && destLon != null
      ? `${destLat},${destLon}`
      : encodeURIComponent(destName);

  const stopLat = selectedStop?.latitude;
  const stopLon = selectedStop?.longitude;
  const stopParam = stopLat != null && stopLon != null ? `${stopLat},${stopLon}` : '';

  // Google Maps Universal URLs
  const fullJourneyUrl =
    originParam && destParam && stopParam
      ? `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&waypoints=${stopParam}&travelmode=driving`
      : null;

  const leg1NavUrl =
    originParam && stopParam
      ? `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${stopParam}&travelmode=driving`
      : null;

  const leg2NavUrl =
    stopParam && destParam
      ? `https://www.google.com/maps/dir/?api=1&origin=${stopParam}&destination=${destParam}&travelmode=driving`
      : null;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Map Interactive Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedStop ? 'bg-amber-500 animate-ping' : 'bg-[#0a8754] animate-pulse'}`}></span>
            <span className="text-xs font-bold text-[#0d233a] uppercase tracking-wider">
              {selectedStop ? 'Multi-Segment EV Journey Route' : 'Route Corridor Interactive Map'}
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

        {/* Dynamic Legend and Re-center action */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500">
            {selectedStop ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-1 rounded-sm bg-[#2563eb]"></span>
                  <span className="font-bold text-[#2563eb]">Leg 1: To Station</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
                  <span className="font-bold text-[#d97706]">Charging Stop</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-1 rounded-sm bg-[#059669]"></span>
                  <span className="font-bold text-[#059669]">Leg 2: To Destination</span>
                </span>
              </>
            ) : (
              <>
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
                  <span className="font-medium text-slate-700">Direct Road Route</span>
                </span>
              </>
            )}
          </div>

          {fullJourneyUrl && (
            <a
              href={fullJourneyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer select-none"
              title="Open complete journey with stop in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Full Journey in Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

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

      {/* Leaflet Map Canvas Container with generous vertical height */}
      <div className="relative w-full h-[470px] sm:h-[530px] lg:h-[590px] bg-slate-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* On-Map Floating Charging Stop Card (When Stop is Selected - Image 2 Enhancement) */}
        {selectedStop && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 z-[400] max-w-sm sm:max-w-md md:max-w-lg bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-amber-300 shadow-xl text-xs max-h-[85%] overflow-y-auto">
            {/* Header with Title, Detour Badge & Remove Button */}
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-black text-[#0d233a] uppercase tracking-wider text-[11px]">
                  Intermediate Charging Stop Added
                </span>
                {segmentedRoute?.overallTrip?.detourKm != null && (
                  <span className="hidden md:inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    +{segmentedRoute.overallTrip.detourKm} km detour
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onOpenStationDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenStationDetails(selectedStop)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                    title="View community reviews & ratings"
                  >
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Reviews</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRemoveStop}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all cursor-pointer select-none"
                  title="Remove intermediate charging stop and restore direct route"
                >
                  ✕ Remove Stop
                </button>
              </div>
            </div>

            {/* Station Details */}
            <div className="mb-3">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-black text-[#0d233a] text-sm sm:text-base leading-tight truncate">
                  {selectedStop.name}
                </h4>
                <span className="text-[11px] font-extrabold text-[#0a8754] shrink-0">
                  {selectedStop.charging_speed || selectedStop.capacity || 25} kW ({selectedStop.power_type || 'DC'})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {selectedStop.address}
              </p>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-600 mt-1">
                <span>Connector: <strong>{selectedStop.charger_type || 'Standard'}</strong></span>
                <span>•</span>
                <span className={selectedStop.available > 0 ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                  {selectedStop.available > 0 ? `${selectedStop.available} Plugs Available` : 'Plugs in use'}
                </span>
              </div>
            </div>

            {/* Two Route Segments Stats Box */}
            {segmentedRoute ? (
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* Leg 1 Box */}
                  <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-blue-700 block text-[9.5px] uppercase tracking-wider mb-0.5">
                        Leg 1: Source → Station
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-slate-900 text-sm">
                          {segmentedRoute.segment1.roadDistanceKm} km
                        </span>
                        <span className="text-slate-500 text-[10.5px]">
                          (~{segmentedRoute.segment1.estimatedDurationMinutes}m)
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 pt-1 border-t border-blue-200/60">
                      Arrive at: <strong className="text-amber-700 font-bold">{segmentedRoute.segment1.batteryArrivalPercent}%</strong>
                    </div>
                  </div>

                  {/* Leg 2 Box */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-emerald-700 block text-[9.5px] uppercase tracking-wider mb-0.5">
                        Leg 2: Station → Dest
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-slate-900 text-sm">
                          {segmentedRoute.segment2.roadDistanceKm} km
                        </span>
                        <span className="text-slate-500 text-[10.5px]">
                          (~{segmentedRoute.segment2.estimatedDurationMinutes}m)
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 pt-1 border-t border-emerald-200/60">
                      Final battery: <strong className="text-emerald-700 font-bold">{segmentedRoute.segment2.batteryFinalPercent}%</strong>
                    </div>
                  </div>
                </div>

                {/* Charging Session Info & Interactive Toggle Button */}
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[10.5px] text-amber-900">
                    <span>Recharge to <strong>80% SoC</strong></span>
                    <span className="text-slate-500 ml-1">
                      (~{segmentedRoute.overallTrip?.estimatedChargingTimeMinutes || 25} mins)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !chargingDone;
                      setChargingDone(next);
                      if (next && selectedStop) {
                        api.reviews
                          .recordVisit(selectedStop.uid || selectedStop.id, {
                            routeOrigin: routeData?.route?.origin?.name || routeData?.route?.origin?.address,
                            routeDestination:
                              routeData?.route?.destination?.name || routeData?.route?.destination?.address,
                            chargingDurationMinutes:
                              segmentedRoute?.overallTrip?.estimatedChargingTimeMinutes || 25,
                            energyAddedKwh: 22,
                          })
                          .catch((err) => console.log('Visit verification recording:', err.message));
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer select-none ${
                      chargingDone
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${chargingDone ? 'fill-white text-emerald-600' : 'text-amber-600'}`} />
                    <span>{chargingDone ? '✓ Charged to 80% (Verified Visit Recorded)' : 'Mark Charging Complete'}</span>
                  </button>
                </div>
              </div>
            ) : segmentLoading ? (
              <div className="text-slate-600 text-xs flex items-center gap-2 py-3 bg-slate-50 rounded-xl px-3 border border-slate-200 mb-3">
                <span className="animate-spin text-amber-600">⚡</span>
                <span className="font-semibold">Calculating road routing for both segments...</span>
              </div>
            ) : null}

            {/* Google Maps Navigation Action Buttons */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              {/* Button 1: Open Complete Multi-Stop Journey in Google Maps */}
              {fullJourneyUrl && (
                <a
                  href={fullJourneyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer select-none"
                  title="Open complete journey with Source, Charging Station, and Destination in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open Full Journey in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Segmented Navigation Buttons: Navigate to Charger & Continue to Destination */}
              <div className="grid grid-cols-2 gap-2">
                {leg1NavUrl && (
                  <a
                    href={leg1NavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer select-none truncate"
                    title={`Open Google Maps directions from ${routeData.route?.origin?.displayName?.split(',')[0] || 'Source'} to ${selectedStop.name}`}
                  >
                    <Navigation className="w-3 h-3 shrink-0" />
                    <span className="truncate">Navigate to Charger</span>
                  </a>
                )}

                {leg2NavUrl && (
                  <a
                    href={leg2NavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer select-none truncate ${
                      chargingDone
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                    }`}
                    title={`Open Google Maps directions from ${selectedStop.name} to ${routeData.route?.destination?.displayName?.split(',')[0] || 'Destination'}`}
                  >
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">Continue to Dest</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left Summary Overlay Pill */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs text-slate-700 flex items-center gap-2 pointer-events-none select-none">
          <MapPin className="w-3.5 h-3.5 text-[#0a8754]" />
          <span>
            {selectedStop ? (
              <>
                <strong>2 Segments active</strong> • Click any marker to switch or inspect stop
              </>
            ) : (
              <>
                Showing <strong>{stationsCount}</strong> charging stations • Click any marker to add as a stop
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
