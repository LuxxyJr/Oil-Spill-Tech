import React, { useState, useRef, useEffect } from 'react';
import { SlickIncident, LiveMarineConditions } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Compass, 
  Eye, 
  ShieldAlert, 
  Globe2, 
  Layers, 
  Satellite, 
  Map as MapIcon,
  Maximize2
} from 'lucide-react';
import { SatelliteGlobe } from './SatelliteGlobe';
import L from 'leaflet';

interface TacticalRadarMapProps {
  incident: SlickIncident;
  marineConditions: LiveMarineConditions;
  isDarkMode: boolean;
}

type MapDisplayMode = 'satellite' | 'globe' | 'tactical';
type SatelliteLayerType = 'esri' | 'sar' | 'false_color' | 'bathymetry';

export const TacticalRadarMap: React.FC<TacticalRadarMapProps> = ({
  incident,
  marineConditions,
  isDarkMode
}) => {
  // Display Mode: Real Satellite Map vs 3D Globe vs Vector Tactical Chart
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>('satellite');
  const [satLayer, setSatLayer] = useState<SatelliteLayerType>('esri');

  // Vector canvas zoom and pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  
  // Layer visibility toggles
  const [showPlume, setShowPlume] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [showEEZ, setShowEEZ] = useState(true);
  const [showIsobath, setShowIsobath] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);
  
  // Drift simulation time offset (in hours, from -2 to +6)
  const [simHour, setSimHour] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  // Active hover waypoint info
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Leaflet Map Refs
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vectorLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize and update Leaflet Satellite Map
  useEffect(() => {
    if (displayMode !== 'satellite' || !leafletContainerRef.current) return;

    // Check if map already exists
    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [18.88, 71.82],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      // Tile Layer Provider (ESRI World Imagery Satellite Tiles)
      const getTileUrl = (type: SatelliteLayerType) => {
        switch (type) {
          case 'sar':
            // High contrast monochromatic SAR backscatter proxy
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
          case 'false_color':
            // Multi-spectral false color (NASA GIBS / ESRI)
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}';
          case 'bathymetry':
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
          case 'esri':
          default:
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        }
      };

      const tileLayer = L.tileLayer(getTileUrl(satLayer), {
        maxZoom: 18,
        crossOrigin: true
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const vectorGroup = L.layerGroup().addTo(map);
      vectorLayerGroupRef.current = vectorGroup;
      leafletMapRef.current = map;

      // Small delay to invalidate size after DOM layout stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    } else {
      leafletMapRef.current.invalidateSize();
    }

    return () => {
      // Keep map instance or cleanup on unmount
    };
  }, [displayMode]);

  // Update Tile Layer when satLayer changes
  useEffect(() => {
    if (!leafletMapRef.current || !tileLayerRef.current) return;
    const urls: Record<SatelliteLayerType, string> = {
      esri: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      sar: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      false_color: 'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}',
      bathymetry: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
    };
    tileLayerRef.current.setUrl(urls[satLayer]);
  }, [satLayer]);

  // Render Vectors (Slick Plume, AIS Track, EEZ) on Leaflet Satellite Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const group = vectorLayerGroupRef.current;
    if (!map || !group || displayMode !== 'satellite') return;

    group.clearLayers();

    // Calculate drift offset in geographic lat/lng
    // 1.2 knots @ 188° S: ~0.02° per hour
    const driftLat = -(simHour * 0.02 * Math.cos((188 * Math.PI) / 180));
    const driftLng = -(simHour * 0.02 * Math.sin((188 * Math.PI) / 180));

    // Base Slick Polygon Coordinates [lat, lng]
    const slickCoords: [number, number][] = [
      [18.90 + driftLat, 71.80 + driftLng],
      [18.83 + driftLat, 71.89 + driftLng],
      [18.81 + driftLat, 71.86 + driftLng],
      [18.88 + driftLat, 71.77 + driftLng]
    ];

    if (showPlume) {
      // SAR Plume Polygon with distinct wine border and dark backscatter
      const plume = L.polygon(slickCoords, {
        color: '#7c2538',
        weight: 2.5,
        fillColor: satLayer === 'sar' ? '#0a0a0a' : '#7c2538',
        fillOpacity: satLayer === 'sar' ? 0.75 : 0.45,
        dashArray: '3, 3'
      }).addTo(group);

      plume.bindTooltip(`<b>Sentinel-1 SAR Slick Plume</b><br/>Est. Mass: ${incident.estimatedSpillMT} MT<br/>Plume Length: ${incident.plumeLengthKm} km`, {
        permanent: false,
        direction: 'top',
        className: 'font-mono text-xs'
      });

      // Slick Origin Apex Marker
      const originMarker = L.circleMarker([18.90 + driftLat, 71.80 + driftLng], {
        radius: 7,
        fillColor: '#7c2538',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).addTo(group);

      originMarker.bindTooltip('<b>Slick Origin Apex</b><br/>04:06Z Apex Intersect (CPA 180m)', {
        permanent: false,
        direction: 'right'
      });
    }

    if (showTrack) {
      // AIS Target Vessel Track Line
      const trackPoints: [number, number][] = [
        [19.08, 71.60], // 03:20Z Transit
        [18.98, 71.70], // 03:45Z
        [18.90, 71.80], // 04:06Z CPA Intersect
        [18.78, 71.92]  // 04:30Z Current Position
      ];

      const trackLine = L.polyline(trackPoints, {
        color: '#ffffff',
        weight: 3,
        dashArray: '8, 6',
        opacity: 0.95
      }).addTo(group);

      trackLine.bindTooltip(`AIS Track: ${incident.targetVessel}`, { permanent: false });

      // Waypoint 03:45Z
      const wp1 = L.circleMarker([18.98, 71.70], {
        radius: 5,
        fillColor: '#ffffff',
        color: '#241910',
        weight: 2,
        fillOpacity: 1
      }).addTo(group);
      wp1.bindTooltip('03:45Z Transit • SOG: 14.2 kts • COG: 155°', { permanent: false });

      // CPA Intersect Marker (04:06Z)
      const cpaMarker = L.circleMarker([18.90, 71.80], {
        radius: 6,
        fillColor: '#7c2538',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).addTo(group);
      cpaMarker.bindTooltip('04:06Z CPA Intersect • Distance: 180m • SOG: 3.4 kts', { permanent: false });

      // Target Vessel Current Marker (Custom SVG Ship Icon)
      const shipIcon = L.divIcon({
        className: 'vessel-marker-icon',
        html: `
          <div style="transform: rotate(152deg); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#241910" stroke-width="1.5">
              <polygon points="12,2 4,20 12,16 20,20" />
            </svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const shipMarker = L.marker([18.78, 71.92], { icon: shipIcon }).addTo(group);
      shipMarker.bindTooltip(`<b>${incident.targetVessel}</b><br/>Current Course: 152° • SOG: 13.8 kts`, {
        permanent: true,
        direction: 'bottom',
        className: 'font-mono text-xs font-bold'
      });
    }

    if (showEEZ) {
      // India 200 NM EEZ Boundary Line
      const eezPoints: [number, number][] = [
        [19.4, 71.2],
        [18.9, 71.5],
        [18.3, 71.9],
        [17.8, 72.3]
      ];

      const eezLine = L.polyline(eezPoints, {
        color: '#e6758a',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(group);

      eezLine.bindTooltip('INDIA 200 NM EEZ BOUNDARY', { permanent: false });
    }

    if (showIsobath) {
      // 50M Depth Isobath Line
      const isobathPoints: [number, number][] = [
        [19.2, 71.7],
        [18.8, 71.85],
        [18.4, 72.0]
      ];

      const isobathLine = L.polyline(isobathPoints, {
        color: '#9cb099',
        weight: 1.5,
        dashArray: '4, 4',
        opacity: 0.7
      }).addTo(group);

      isobathLine.bindTooltip('50M DEPTH ISOBATH', { permanent: false });
    }

  }, [displayMode, satLayer, showPlume, showTrack, showEEZ, showIsobath, simHour, incident]);

  // Non-glitching Pointer Events for Tactical Vector Map
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  const resetVectorView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSimHour(0);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([18.88, 71.82], 10);
    }
  };

  // Playback simulation timer
  useEffect(() => {
    if (isPlayingSim) {
      const interval = setInterval(() => {
        setSimHour((prev) => (prev >= 6 ? -2 : Math.round((prev + 0.5) * 10) / 10));
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isPlayingSim]);

  // Vector drift offset calculation: current 1.2 knots @ 188° S
  const driftOffsetX = (simHour * 8 * Math.sin((188 * Math.PI) / 180));
  const driftOffsetY = (simHour * 8 * Math.cos((188 * Math.PI) / 180));

  return (
    <div className="w-full rounded-lg border border-[var(--color-outline-variant)]/70 bg-[var(--color-surface)] overflow-hidden flex flex-col shadow-xs transition-colors">
      
      {/* Radar / Satellite Card Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-[var(--color-outline-variant)]/50 flex flex-wrap items-center justify-between gap-3 bg-[var(--color-surface-container)]/40">
        
        {/* Title & Live Satellite Mode Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface)]">
              {displayMode === 'satellite' && 'High-Res Satellite Radar • Arabian Sea Sector IV'}
              {displayMode === 'globe' && '3D Satellite Earth Globe • Global Orbit Telemetry'}
              {displayMode === 'tactical' && 'Tactical Radar View • Arabian Sea Sector IV'}
            </h3>
          </div>
        </div>

        {/* View Mode Switcher (Satellite vs 3D Globe vs Vector) */}
        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-md border border-[var(--color-outline-variant)]/70 shadow-xs">
          <button
            onClick={() => setDisplayMode('satellite')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              displayMode === 'satellite'
                ? 'bg-[var(--color-primary)] text-white font-bold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
            }`}
            title="Switch to Real Satellite Imagery Tiles"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite Map</span>
          </button>

          <button
            onClick={() => setDisplayMode('globe')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              displayMode === 'globe'
                ? 'bg-[var(--color-primary)] text-white font-bold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
            }`}
            title="Switch to 3D Orbiting Satellite Earth Globe"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>3D Globe</span>
          </button>

          <button
            onClick={() => setDisplayMode('tactical')}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              displayMode === 'tactical'
                ? 'bg-[var(--color-primary)] text-white font-bold shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
            }`}
            title="Switch to Vector Tactical Chart"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Tactical Chart</span>
          </button>
        </div>

        {/* Satellite Layer Sub-Switcher (Only active in Satellite mode) */}
        {displayMode === 'satellite' && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] uppercase text-[var(--color-outline)] hidden xl:inline">Sensor:</span>
            <select
              value={satLayer}
              onChange={(e) => setSatLayer(e.target.value as SatelliteLayerType)}
              className="px-2 py-0.5 rounded border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-on-surface)] text-xs font-mono cursor-pointer outline-none"
            >
              <option value="esri">🛰️ ESRI World Satellite (True Color)</option>
              <option value="sar">📡 Sentinel-1 SAR (Radar Backscatter)</option>
              <option value="bathymetry">🌊 Ocean Bathymetry Base</option>
              <option value="false_color">🌈 Multi-Spectral False Color</option>
            </select>
          </div>
        )}

      </div>

      {/* Main Map / Globe Container */}
      <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px] bg-[var(--color-surface)] overflow-hidden">
        
        {/* Top-Left Geographic Coordinate Overlay (Image 1) */}
        <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-[var(--color-surface)]/90 border border-[var(--color-outline-variant)]/60 text-xs font-mono text-[var(--color-on-surface-variant)] shadow-xs backdrop-blur-xs flex items-center gap-2">
          <span>{incident.coordinates}</span>
          <span className="text-[10px] text-[var(--color-outline)]">• 82 NM Off Mumbai High</span>
        </div>

        {/* Top-Right Floating CPA Badge (Matching Image 1 exact box) */}
        <div className="absolute top-4 right-4 z-20 p-3 rounded bg-[#ffffff]/95 dark:bg-[#281d1a]/95 border border-[#dbc0c2] dark:border-[#554244] shadow-md max-w-[240px] backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#7c2538] dark:text-[#e6758a] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c2538] dark:bg-[#e6758a]" />
            <span>Closest Point of Approach</span>
          </div>
          <div className="font-mono text-base font-bold text-[#241910] dark:text-[#faede7] mt-0.5">
            {incident.cpaMeters}m at {incident.cpaTime}
          </div>
          <div className="text-[11px] text-[#554244] dark:text-[#d4bec0]">
            Target: {incident.targetVessel}
          </div>
        </div>

        {/* MODE 1: REAL SATELLITE MAP (LEAFLET WITH ESRI / SENTINEL-1 TILES) */}
        <div 
          ref={leafletContainerRef} 
          className={`w-full h-full ${displayMode === 'satellite' ? 'block' : 'hidden'}`}
          style={{ zIndex: 1 }}
        />

        {/* MODE 2: 3D INTERACTIVE SATELLITE GLOBE */}
        {displayMode === 'globe' && (
          <div className="w-full h-full relative" style={{ zIndex: 1 }}>
            <SatelliteGlobe 
              activeHotspotId="mumbai" 
              isDarkMode={isDarkMode} 
            />
          </div>
        )}

        {/* MODE 3: TACTICAL VECTOR CHART (Zero-glitch pointer capture) */}
        {displayMode === 'tactical' && (
          <div 
            className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none relative"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ zIndex: 1 }}
          >
            <svg 
              className="w-full h-full pointer-events-none" 
              viewBox="0 0 1000 650" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 40 0 L 0 0 0 40" 
                    fill="none" 
                    stroke={isDarkMode ? '#322521' : '#f0ded4'} 
                    strokeWidth="1" 
                  />
                </pattern>
                <pattern id="slickHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line 
                    x1="0" y1="0" x2="0" y2="8" 
                    stroke={isDarkMode ? '#e6758a' : '#7c2538'} 
                    strokeWidth="1.5" 
                    strokeOpacity="0.45" 
                  />
                </pattern>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '500px 325px' }}>
                <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#radarGrid)" />

                {/* 50M Depth Isobath */}
                {showIsobath && (
                  <g>
                    <path 
                      d="M 0 290 Q 300 280 600 320 T 1000 340" 
                      fill="none" 
                      stroke={isDarkMode ? '#554244' : '#dbc0c2'} 
                      strokeWidth="1.2" 
                      strokeDasharray="4 4" 
                    />
                    <text x="380" y="292" className="font-mono text-[9px] uppercase tracking-wider" fill={isDarkMode ? '#9c8486' : '#887274'}>
                      50M DEPTH ISOBATH
                    </text>
                  </g>
                )}

                {/* EEZ Boundary */}
                {showEEZ && (
                  <g>
                    <path 
                      d="M 0 480 Q 400 450 700 400 T 1000 370" 
                      fill="none" 
                      stroke={isDarkMode ? '#9c8486' : '#887274'} 
                      strokeWidth="1.4" 
                      strokeDasharray="6 4" 
                    />
                    <text x="710" y="425" className="font-mono text-[9px] uppercase tracking-wider font-semibold" fill={isDarkMode ? '#9c8486' : '#554244'} transform="rotate(-5 710 425)">
                      INDIA 200 NM EEZ BOUNDARY
                    </text>
                  </g>
                )}

                {/* Wind Vectors */}
                {showWindVectors && (
                  <g opacity="0.4">
                    {[
                      { x: 150, y: 150 },
                      { x: 450, y: 120 },
                      { x: 800, y: 180 },
                      { x: 250, y: 400 },
                      { x: 850, y: 480 }
                    ].map((pos, idx) => (
                      <g key={idx} transform={`translate(${pos.x}, ${pos.y}) rotate(${marineConditions.windDirectionDeg})`}>
                        <line x1="0" y1="-15" x2="0" y2="15" stroke={isDarkMode ? '#9cb099' : '#566153'} strokeWidth="1" />
                        <polyline points="-3,-10 0,-15 3,-10" fill="none" stroke={isDarkMode ? '#9cb099' : '#566153'} strokeWidth="1" />
                      </g>
                    ))}
                  </g>
                )}

                {/* SAR Slick Plume */}
                {showPlume && (
                  <g transform={`translate(${driftOffsetX}, ${driftOffsetY})`} className="transition-transform duration-300">
                    <polygon 
                      points="610,320 682,382 654,392 602,328" 
                      fill="url(#slickHatch)"
                      stroke={isDarkMode ? '#e6758a' : '#7c2538'}
                      strokeWidth="1.8"
                    />
                    <path 
                      d="M 610 320 Q 640 350 682 382" 
                      fill="none" 
                      stroke={isDarkMode ? '#e6758a' : '#7c2538'} 
                      strokeWidth="1.5" 
                      strokeDasharray="2 2"
                    />
                    <line x1="660" y1="360" x2="725" y2="340" stroke={isDarkMode ? '#e6758a' : '#7c2538'} strokeWidth="0.8" strokeDasharray="3 2" />
                    <text x="730" y="342" className="font-mono text-[10px] font-semibold" fill={isDarkMode ? '#e6758a' : '#7c2538'}>
                      SAR Slick Plume ({incident.plumeLengthKm} km)
                    </text>
                    <circle cx="640" cy="355" r="4" fill={isDarkMode ? '#e6758a' : '#7c2538'} />
                    <circle cx="640" cy="355" r="9" fill="none" stroke={isDarkMode ? '#e6758a' : '#7c2538'} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="642" cy="368" r="5" fill="#7c2538" />
                    <text x="653" y="372" className="font-mono text-[9px] font-medium" fill={isDarkMode ? '#faede7' : '#241910'}>
                      04:06Z Apex Intersect (CPA 180m)
                    </text>
                  </g>
                )}

                {/* Target Vessel AIS Track */}
                {showTrack && (
                  <g>
                    <line 
                      x1="578" y1="262" 
                      x2="692" y2="442" 
                      stroke={isDarkMode ? '#faede7' : '#241910'} 
                      strokeWidth="2.2" 
                      strokeDasharray="6 4" 
                    />
                    <circle cx="596" cy="290" r="3.5" fill={isDarkMode ? '#191210' : '#ffffff'} stroke={isDarkMode ? '#faede7' : '#241910'} strokeWidth="2" />
                    <text x="605" y="294" className="font-mono text-[10px]" fill={isDarkMode ? '#faede7' : '#241910'}>
                      03:45Z
                    </text>
                    <circle cx="642" cy="364" r="4" fill={isDarkMode ? '#faede7' : '#241910'} />
                    <g transform="translate(680, 424) rotate(152)">
                      <polygon points="0,-10 -6,8 6,8" fill={isDarkMode ? '#faede7' : '#241910'} />
                    </g>
                    <text x="690" y="428" className="font-mono text-[10px] font-bold" fill={isDarkMode ? '#faede7' : '#241910'}>
                      {incident.targetVessel} (Current Course)
                    </text>
                  </g>
                )}

              </g>
            </svg>
          </div>
        )}

        {/* Floating Zoom Controls for Tactical Mode */}
        {displayMode !== 'globe' && (
          <div className="absolute bottom-16 right-4 z-20 flex flex-col gap-1.5 bg-[var(--color-surface-container-lowest)]/95 p-1.5 rounded-md border border-[var(--color-outline-variant)] shadow-sm backdrop-blur-xs">
            <button 
              onClick={() => {
                if (displayMode === 'satellite' && leafletMapRef.current) {
                  leafletMapRef.current.zoomIn();
                } else {
                  setZoom(z => Math.min(2.5, z + 0.25));
                }
              }} 
              className="p-1.5 hover:bg-[var(--color-surface-container)] rounded text-[var(--color-on-surface)]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (displayMode === 'satellite' && leafletMapRef.current) {
                  leafletMapRef.current.zoomOut();
                } else {
                  setZoom(z => Math.max(0.6, z - 0.25));
                }
              }} 
              className="p-1.5 hover:bg-[var(--color-surface-container)] rounded text-[var(--color-on-surface)]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={resetVectorView} 
              className="p-1.5 hover:bg-[var(--color-surface-container)] rounded text-[var(--color-on-surface)]"
              title="Reset View to Incident Focus"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hydrodynamic Drift Simulation Scrub Bar */}
        {displayMode !== 'globe' && (
          <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-[var(--color-surface)]/95 border border-[var(--color-outline-variant)]/70 backdrop-blur-xs text-xs font-mono shadow-xs">
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPlayingSim(!isPlayingSim)}
                className="p-1.5 rounded bg-[var(--color-surface-container)] text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                title={isPlayingSim ? 'Pause Drift Simulation' : 'Play Hydrodynamic Drift Forecast'}
              >
                {isPlayingSim ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                  Drift Model:
                </span>
                <span className="font-bold text-[var(--color-primary)]">
                  {simHour >= 0 ? `+${simHour}h Forecast` : `${simHour}h Backtrack`}
                </span>
              </div>

              <input 
                type="range" 
                min="-2" 
                max="6" 
                step="0.5" 
                value={simHour} 
                onChange={(e) => setSimHour(parseFloat(e.target.value))}
                className="w-24 sm:w-40 accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            {/* Layer toggles */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-[var(--color-on-surface-variant)]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showPlume} onChange={(e) => setShowPlume(e.target.checked)} className="accent-[var(--color-primary)]" />
                <span>Plume</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showTrack} onChange={(e) => setShowTrack(e.target.checked)} className="accent-[var(--color-primary)]" />
                <span>AIS Track</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showEEZ} onChange={(e) => setShowEEZ(e.target.checked)} className="accent-[var(--color-primary)]" />
                <span>EEZ</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showIsobath} onChange={(e) => setShowIsobath(e.target.checked)} className="accent-[var(--color-primary)]" />
                <span>50m Depth</span>
              </label>
            </div>

          </div>
        )}

      </div>

      {/* Radar / Satellite Bottom Metadata Bar (Image 1 Exact Layout) */}
      <div className="px-4 sm:px-6 py-2.5 border-t border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)]/30 flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--color-on-surface-variant)] gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[var(--color-on-surface)]" />
            Vessel Track
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 border border-[var(--color-primary)] bg-[var(--color-primary)]/30" />
            Slick Footprint
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-widest text-[var(--color-outline)]">---</span>
            EEZ Limit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            Slick Origin
          </span>
        </div>
        <div className="text-[10px] tracking-wider text-[var(--color-outline)]">
          {displayMode === 'satellite' ? 'Sentinel-1 C-SAR & ESRI World Imagery • 10m Ground Resolution' : 'Mercator WGS-84 • Indian Ocean Sector IV'}
        </div>
      </div>

    </div>
  );
};
