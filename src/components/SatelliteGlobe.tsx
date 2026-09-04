import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Compass, Satellite, Globe2, Eye, ShieldAlert, Radio } from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'Active Alert' | 'Monitored' | 'Clear';
  vessels: number;
  spillMT?: number;
  region: string;
}

const GLOBAL_HOTSPOTS: Hotspot[] = [
  { id: 'mumbai', name: 'Mumbai High Sector IV', lat: 18.9, lng: 71.8, status: 'Active Alert', vessels: 34, spillMT: 28.4, region: 'Arabian Sea / India EEZ' },
  { id: 'malacca', name: 'Strait of Malacca', lat: 2.5, lng: 101.8, status: 'Monitored', vessels: 142, region: 'Southeast Asia' },
  { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.5, lng: 56.2, status: 'Monitored', vessels: 88, region: 'Persian Gulf' },
  { id: 'guinea', name: 'Gulf of Guinea Delta', lat: 4.2, lng: 6.0, status: 'Monitored', vessels: 45, region: 'West Africa' },
  { id: 'english', name: 'Dover Strait', lat: 51.1, lng: 1.4, status: 'Clear', vessels: 110, region: 'English Channel' },
  { id: 'suez', name: 'Gulf of Suez / Red Sea', lat: 28.2, lng: 33.3, status: 'Monitored', vessels: 62, region: 'Red Sea' }
];

interface SatelliteGlobeProps {
  onSelectHotspot?: (hotspot: Hotspot) => void;
  activeHotspotId?: string;
  isDarkMode?: boolean;
}

export const SatelliteGlobe: React.FC<SatelliteGlobeProps> = ({
  onSelectHotspot,
  activeHotspotId = 'mumbai',
  isDarkMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Globe rotation angles in radians
  const [rotation, setRotation] = useState<{ yaw: number; pitch: number }>({
    yaw: -1.25, // Centered around Indian Ocean / India
    pitch: 0.32
  });
  const [zoom, setZoom] = useState<number>(1.1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(
    GLOBAL_HOTSPOTS.find(h => h.id === activeHotspotId) || GLOBAL_HOTSPOTS[0]
  );
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [satellitePassProgress, setSatellitePassProgress] = useState<number>(0);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setSatellitePassProgress(prev => (prev + 0.003) % 1);
      if (autoRotate && !isDragging) {
        setRotation(r => ({ ...r, yaw: r.yaw + 0.002 }));
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, isDragging]);

  // Render 3D Earth onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38 * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Space / Ocean Background
    const spaceGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, Math.max(width, height) * 0.7);
    if (isDarkMode) {
      spaceGrad.addColorStop(0, '#16110f');
      spaceGrad.addColorStop(1, '#0e0a09');
    } else {
      spaceGrad.addColorStop(0, '#fffbf9');
      spaceGrad.addColorStop(1, '#faeade');
    }
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle star / telemetry background grid dots
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(124, 37, 56, 0.12)';
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 93.7) * 0.5 + 0.5) * height;
      const dist = Math.hypot(sx - cx, sy - cy);
      if (dist > radius * 1.05) {
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    // Outer Atmospheric Limb Glow
    const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15);
    atmosGrad.addColorStop(0, 'rgba(56, 140, 200, 0.28)');
    atmosGrad.addColorStop(0.5, 'rgba(124, 37, 56, 0.1)');
    atmosGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = atmosGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Earth Ocean Base Sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Ocean Gradient with 3D spherical lighting
    const oceanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    if (isDarkMode) {
      oceanGrad.addColorStop(0, '#1d3e58');
      oceanGrad.addColorStop(0.6, '#0f2434');
      oceanGrad.addColorStop(1, '#08131d');
    } else {
      oceanGrad.addColorStop(0, '#2d5a7b');
      oceanGrad.addColorStop(0.65, '#193b54');
      oceanGrad.addColorStop(1, '#0e2333');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // 3D Coordinate Projection Function
    const project = (latDeg: number, lngDeg: number) => {
      const phi = (latDeg * Math.PI) / 180;
      const lambda = (lngDeg * Math.PI) / 180;

      // Spherical coordinates
      const x0 = Math.cos(phi) * Math.sin(lambda);
      const y0 = Math.sin(phi);
      const z0 = Math.cos(phi) * Math.cos(lambda);

      // Rotate around Y axis (yaw)
      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = x0 * cosY + z0 * sinY;
      const y1 = y0;
      const z1 = -x0 * sinY + z0 * cosY;

      // Rotate around X axis (pitch)
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      return {
        x: cx + x2 * radius,
        y: cy - y2 * radius,
        visible: z2 > 0,
        depth: z2
      };
    };

    // Draw Graticule Lines (Parallels and Meridians)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;

    // Latitude parallels
    [-60, -30, 0, 30, 60].forEach(lat => {
      ctx.beginPath();
      let first = true;
      for (let lng = -180; lng <= 180; lng += 5) {
        const p = project(lat, lng);
        if (p.visible) {
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    });

    // Longitude meridians
    [-120, -60, 0, 60, 120, 180].forEach(lng => {
      ctx.beginPath();
      let first = true;
      for (let lat = -80; lat <= 80; lat += 5) {
        const p = project(lat, lng);
        if (p.visible) {
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    });

    // Draw Continents / Landmass Polygons (Geometric High-Visibility Approximations)
    // India subcontinent, Asia, Africa, Europe, Australia, Americas
    const CONTINENT_POLYGONS: [number, number][][] = [
      // Indian Subcontinent & South Asia
      [
        [24, 68], [28, 70], [32, 75], [30, 80], [28, 88], [26, 92], [22, 90], 
        [20, 86], [16, 82], [13, 80], [8.5, 77.5], [10, 76], [15, 74], [19, 72.8], [23, 69]
      ],
      // Arabian Peninsula
      [
        [12.5, 44], [15, 53], [24, 57], [26, 56], [28, 48], [30, 48], [31, 35], [22, 38], [13, 44]
      ],
      // Africa Coastline
      [
        [37, 10], [32, 32], [12, 44], [0, 42], [-10, 40], [-25, 33], [-34, 18], [-33, 27], 
        [-20, 13], [5, 1], [5, -4], [15, -17], [30, -10], [35, -5]
      ],
      // Southeast Asia / Malay Peninsula / Indonesia
      [
        [20, 105], [10, 100], [1.3, 103.8], [6, 102], [15, 108], [22, 108]
      ],
      // Europe & Mediterranean
      [
        [36, -5], [43, 3], [48, -2], [54, 8], [58, 12], [60, 28], [45, 30], [40, 25], [38, 24], [36, 15]
      ],
      // Australia
      [
        [-12, 131], [-15, 136], [-12, 142], [-25, 153], [-38, 145], [-35, 115], [-22, 114], [-15, 124]
      ]
    ];

    ctx.fillStyle = isDarkMode ? '#243a29' : '#3d5940';
    ctx.strokeStyle = isDarkMode ? '#446648' : '#628a67';
    ctx.lineWidth = 1.2;

    CONTINENT_POLYGONS.forEach(poly => {
      ctx.beginPath();
      let visibleCount = 0;
      poly.forEach((pt, i) => {
        const p = project(pt[0], pt[1]);
        if (p.visible) visibleCount++;
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.closePath();
      if (visibleCount > poly.length * 0.3) {
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw Major Shipping Corridors (Lanes)
    const SHIPPING_LANES: [number, number][][] = [
      // Persian Gulf to Malacca via Arabian Sea (Past Mumbai)
      [[26, 56], [22, 60], [18.9, 71.8], [8, 77], [5, 80], [6, 95], [2.5, 101.8]],
      // Red Sea to India
      [[13, 44], [14, 53], [18.9, 71.8]],
      // Cape of Good Hope to Asia
      [[-34, 18], [-20, 50], [0, 75], [5, 80]]
    ];

    ctx.strokeStyle = 'rgba(230, 117, 138, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    SHIPPING_LANES.forEach(lane => {
      ctx.beginPath();
      let first = true;
      lane.forEach(pt => {
        const p = project(pt[0], pt[1]);
        if (p.visible) {
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      });
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw Active Satellite Swath / Ground Track (Sentinel-1A Polar Orbit)
    // Polar sun-synchronous orbit at 98.18° inclination
    const satOrbitPoints: [number, number][] = [];
    const orbitLngOffset = (satellitePassProgress * 360) % 360 - 180;
    for (let t = -80; t <= 80; t += 4) {
      const satLat = t;
      const satLng = (orbitLngOffset + t * 0.3) % 360;
      satOrbitPoints.push([satLat, satLng]);
    }

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let satPathFirst = true;
    satOrbitPoints.forEach(pt => {
      const p = project(pt[0], pt[1]);
      if (p.visible) {
        if (satPathFirst) {
          ctx.moveTo(p.x, p.y);
          satPathFirst = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    });
    ctx.stroke();

    // Satellite current position (Copernicus Sentinel-1A)
    const currentSatLat = Math.sin(satellitePassProgress * Math.PI * 2) * 75;
    const currentSatLng = (orbitLngOffset + currentSatLat * 0.3);
    const satProj = project(currentSatLat, currentSatLng);

    if (satProj.visible) {
      // Swath cone footprint on Earth surface
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.beginPath();
      ctx.ellipse(satProj.x, satProj.y, radius * 0.14, radius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Icon / Cross
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(satProj.x, satProj.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Label
      ctx.font = '10px "Space Grotesk", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SENTINEL-1A (SAR)', satProj.x + 8, satProj.y - 6);
    }

    // Draw Global Spill Hotspots
    GLOBAL_HOTSPOTS.forEach(hotspot => {
      const p = project(hotspot.lat, hotspot.lng);
      if (p.visible) {
        const isSelected = hotspot.id === selectedHotspot.id;
        
        // Pulsing alert ring for Active Alert
        if (hotspot.status === 'Active Alert') {
          ctx.strokeStyle = '#e6758a';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 12 : 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#7c2538';
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 6 : 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = hotspot.status === 'Monitored' ? '#d97706' : '#10b981';
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hotspot Label
        ctx.font = isSelected ? 'bold 11px "Space Grotesk", sans-serif' : '10px "Space Grotesk", sans-serif';
        ctx.fillStyle = isDarkMode ? '#faede7' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(hotspot.name, p.x + 8, p.y + 4);
        ctx.shadowBlur = 0;
      }
    });

    // Sun / Specular Light Reflection & Shadow Hemisphere (Terminator)
    const lightGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    lightGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.restore(); // Restore clip

    // Globe Boundary Ring
    ctx.strokeStyle = isDarkMode ? '#554244' : '#dbc0c2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

  }, [rotation, zoom, selectedHotspot, satellitePassProgress, isDarkMode]);

  // Pointer drag handling for 3D rotation (smooth, non-glitching)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: rotation.yaw,
      pitch: rotation.pitch
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Sensitivity factor
    const factor = 0.005 / zoom;
    const newYaw = dragStartRef.current.yaw + dx * factor;
    const newPitch = Math.max(-1.2, Math.min(1.2, dragStartRef.current.pitch - dy * factor));
    
    setRotation({ yaw: newYaw, pitch: newPitch });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.7, Math.min(2.0, z - e.deltaY * 0.001)));
  };

  // Fly directly to a hotspot location on the globe
  const flyToHotspot = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    onSelectHotspot?.(hotspot);
    
    // Target angles for hotspot
    const targetYaw = -((hotspot.lng * Math.PI) / 180);
    const targetPitch = (hotspot.lat * Math.PI) / 180 * 0.7;

    setRotation({
      yaw: targetYaw,
      pitch: targetPitch
    });
  };

  const resetGlobe = () => {
    setRotation({ yaw: -1.25, pitch: 0.32 });
    setZoom(1.1);
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px] bg-[#fff8f5] dark:bg-[#16110f] overflow-hidden select-none flex flex-col justify-between">
      
      {/* Top Floating Orbit Telemetry Strip */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Active Satellite Pass Pill */}
        <div className="pointer-events-auto px-3 py-1.5 rounded-md bg-[#ffffff]/90 dark:bg-[#201715]/90 border border-[#dbc0c2] dark:border-[#554244] shadow-xs backdrop-blur-xs flex items-center gap-2.5">
          <Satellite className="w-4 h-4 text-[#7c2538] dark:text-[#e6758a] animate-pulse" />
          <div className="text-xs font-mono">
            <span className="font-bold text-[#241910] dark:text-[#faede7]">Copernicus Sentinel-1A</span>
            <span className="text-[#554244] dark:text-[#d4bec0] ml-2">Orbit: 693 km • SAR C-Band (5.4 GHz)</span>
          </div>
        </div>

        {/* Global Hotspots Fly-To Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {GLOBAL_HOTSPOTS.map(h => (
            <button
              key={h.id}
              onClick={() => flyToHotspot(h)}
              className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-all ${
                selectedHotspot.id === h.id
                  ? 'bg-[#7c2538] text-white font-bold shadow-xs'
                  : 'bg-[#ffffff]/80 dark:bg-[#281d1a]/80 text-[#554244] dark:text-[#d4bec0] hover:bg-[#ffeada] border border-[#dbc0c2]/60 dark:border-[#554244]/60'
              }`}
            >
              {h.id === 'mumbai' ? '🚨 ' : ''}{h.name.split(' ')[0]}
            </button>
          ))}
        </div>

      </div>

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={650}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Bottom Floating Hotspot Inspector Card */}
      <div className="absolute bottom-4 left-4 z-10 p-3 rounded-lg bg-[#ffffff]/95 dark:bg-[#201715]/95 border border-[#dbc0c2] dark:border-[#554244] shadow-md max-w-xs backdrop-blur-xs font-mono">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#dbc0c2]/40 dark:border-[#554244]/40">
          <span className="font-bold text-[#241910] dark:text-[#faede7]">{selectedHotspot.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            selectedHotspot.status === 'Active Alert'
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300'
              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
          }`}>
            {selectedHotspot.status}
          </span>
        </div>
        <div className="text-[11px] text-[#554244] dark:text-[#d4bec0] mt-1.5 flex flex-col gap-0.5">
          <div>Region: {selectedHotspot.region}</div>
          <div>Coordinates: {selectedHotspot.lat}°N, {selectedHotspot.lng}°E</div>
          {selectedHotspot.spillMT && (
            <div className="font-bold text-[#7c2538] dark:text-[#e6758a]">
              Estimated Discharge: {selectedHotspot.spillMT} MT
            </div>
          )}
          <div className="text-[10px] text-[#887274] mt-1">
            Drag to rotate globe • Scroll to zoom • Click buttons to target
          </div>
        </div>
      </div>

      {/* Floating Zoom & Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-[#ffffff]/90 dark:bg-[#281d1a]/90 p-1.5 rounded-md border border-[#dbc0c2]/70 dark:border-[#554244]/70 shadow-sm backdrop-blur-xs">
        <button
          onClick={() => setZoom(z => Math.min(2.0, z + 0.2))}
          className="p-1.5 hover:bg-[#ffeada] dark:hover:bg-[#322521] rounded text-[#241910] dark:text-[#faede7]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.7, z - 0.2))}
          className="p-1.5 hover:bg-[#ffeada] dark:hover:bg-[#322521] rounded text-[#241910] dark:text-[#faede7]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetGlobe}
          className="p-1.5 hover:bg-[#ffeada] dark:hover:bg-[#322521] rounded text-[#241910] dark:text-[#faede7]"
          title="Reset Globe View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded transition-colors ${
            autoRotate
              ? 'bg-[#7c2538] text-white'
              : 'hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#241910] dark:text-[#faede7]'
          }`}
          title="Toggle Auto Orbit Rotation"
        >
          <Globe2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
