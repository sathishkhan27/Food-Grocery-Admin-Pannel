/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Compass, ShieldAlert } from "lucide-react";
import { LatLng } from "../types.js";

interface SimulatedMapProps {
  customerLocation?: LatLng;
  restaurantLocation?: LatLng;
  driverLocation?: LatLng;
  routeNodes?: LatLng[];
  interactive?: boolean;
  onSelectLocation?: (location: LatLng, address: string) => void;
  height?: string;
  zoomLevel?: number;
}

// Fixed landmarks in our simulated PingZo Metropolis
const LANDMARKS = [
  { name: "Downtown Center", lat: 37.7749, lng: -122.4194, type: "city" },
  { name: "Soma Organic Grocers", lat: 37.7712, lng: -122.4205, type: "store" },
  { name: "The Gourmet Burger Hub", lat: 37.7765, lng: -122.4102, type: "restaurant" },
  { name: "Mission District Pizzeria", lat: 37.7651, lng: -122.4241, type: "restaurant" },
  { name: "Marina Fresh Supermarket", lat: 37.7854, lng: -122.4189, type: "store" },
  { name: "Golden Gate park Depot", lat: 37.7699, lng: -122.4352, type: "hub" },
];

// Helper to convert LatLng to SVG X/Y percentage coordinates
// Bounds roughly mapped: lat [37.760, 37.790], lng [-122.440, -122.400]
function projectLatLng(lat: number, lng: number, width: number, height: number) {
  const minLat = 37.760;
  const maxLat = 37.790;
  const minLng = -122.440;
  const maxLng = -122.400;

  // Invert Y because SVG coordinates go top-to-bottom
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

  return { x, y };
}

// Inverse project X/Y from pixel to LatLng
function unprojectXY(x: number, y: number, width: number, height: number): LatLng {
  const minLat = 37.760;
  const maxLat = 37.790;
  const minLng = -122.440;
  const maxLng = -122.400;

  const lng = minLng + (x / width) * (maxLng - minLng);
  const lat = minLat + ((height - y) / height) * (maxLat - minLat);

  return { lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) };
}

export default function SimulatedMap({
  customerLocation,
  restaurantLocation,
  driverLocation,
  routeNodes = [],
  interactive = false,
  onSelectLocation,
  height = "h-64",
  zoomLevel = 14
}: SimulatedMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
  const [hoverCoord, setHoverCoord] = useState<LatLng | null>(null);

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 500,
          height: entry.contentRect.height || 300
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height: viewHeight } = dimensions;

  // Get SVG projection coords
  const customerProj = customerLocation ? projectLatLng(customerLocation.lat, customerLocation.lng, width, viewHeight) : null;
  const restaurantProj = restaurantLocation ? projectLatLng(restaurantLocation.lat, restaurantLocation.lng, width, viewHeight) : null;
  const driverProj = driverLocation ? projectLatLng(driverLocation.lat, driverLocation.lng, width, viewHeight) : null;

  // Route path generator
  let routePathString = "";
  if (routeNodes && routeNodes.length > 0) {
    routePathString = routeNodes
      .map((node, i) => {
        const { x, y } = projectLatLng(node.lat, node.lng, width, viewHeight);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onSelectLocation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedCoord = unprojectXY(x, y, width, viewHeight);

    // Geocode to a friendly name based on nearest landmark
    let nearestLandmark = "PingZo Heights Avenue";
    let minDistance = 99999;
    LANDMARKS.forEach((lm) => {
      const d = Math.sqrt(Math.pow(lm.lat - clickedCoord.lat, 2) + Math.pow(lm.lng - clickedCoord.lng, 2));
      if (d < minDistance) {
        minDistance = d;
        nearestLandmark = lm.name;
      }
    });

    const streetNumber = Math.floor(Math.random() * 800) + 100;
    const suffixes = ["St", "Ave", "Blvd", "Way"];
    const suffix = suffixes[Math.floor((clickedCoord.lat + clickedCoord.lng) * 1000) % suffixes.length];
    const generatedAddress = `${streetNumber} Near ${nearestLandmark} ${suffix}, PingZo Metropolis`;

    onSelectLocation(clickedCoord, generatedAddress);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverCoord(unprojectXY(x, y, width, viewHeight));
  };

  return (
    <div ref={containerRef} className={`relative w-full ${height} bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-200`}>
      {/* City Map Blueprint SVG Backdrop */}
      <svg
        id="simulated-vector-map"
        className={`w-full h-full ${interactive ? "cursor-crosshair" : "cursor-default"} select-none`}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoord(null)}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="1" />
          </pattern>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </radialGradient>
        </defs>

        {/* Base map filling */}
        <rect width="100%" height="100%" fill="url(#mapGlow)" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Abstract Highway Lines / Main Arteries */}
        <path d={`M 0,${viewHeight * 0.2} Q ${width * 0.5},${viewHeight * 0.4} ${width},${viewHeight * 0.1}`} fill="none" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="6" strokeLinecap="round" />
        <path d={`M ${width * 0.25},0 L ${width * 0.35},${viewHeight}`} fill="none" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="5" />
        <path d={`M ${width * 0.75},0 L ${width * 0.65},${viewHeight}`} fill="none" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="5" />
        <path d={`M 0,${viewHeight * 0.7} L ${width},${viewHeight * 0.8}`} fill="none" stroke="rgba(203, 213, 225, 0.5)" strokeWidth="4" />

        {/* Minor grid streets */}
        {[...Array(8)].map((_, i) => (
          <line
            key={`h-st-${i}`}
            x1="0"
            y1={viewHeight * (0.1 + i * 0.12)}
            x2={width}
            y2={viewHeight * (0.1 + i * 0.12)}
            stroke="rgba(226, 232, 240, 0.8)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v-st-${i}`}
            x1={width * (0.1 + i * 0.12)}
            y1="0"
            x2={width * (0.1 + i * 0.12)}
            y2={viewHeight}
            stroke="rgba(226, 232, 240, 0.8)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* Landmarks Background Rings */}
        {LANDMARKS.map((lm, idx) => {
          const { x, y } = projectLatLng(lm.lat, lm.lng, width, viewHeight);
          return (
            <g key={`lm-${idx}`} className="opacity-70">
              <circle cx={x} cy={y} r="5" fill="#94a3b8" />
              <circle cx={x} cy={y} r="15" fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2 2" />
              <text x={x + 8} y={y + 4} fill="#64748b" className="text-[10px] font-sans pointer-events-none select-none font-bold">
                {lm.name}
              </text>
            </g>
          );
        })}

        {/* Navigation Route Trail */}
        {routePathString && (
          <>
            <path
              d={routePathString}
              fill="none"
              stroke="#fed7aa"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            />
            <path
              d={routePathString}
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3"
              className="animate-[dash_10s_linear_infinite]"
              style={{
                strokeDashoffset: 10
              }}
            />
          </>
        )}

        {/* Restaurant Pin */}
        {restaurantProj && (
          <g className="transition-all duration-500">
            <circle cx={restaurantProj.x} cy={restaurantProj.y} r="16" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
            <circle cx={restaurantProj.x} cy={restaurantProj.y} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <path d={`M ${restaurantProj.x - 4} ${restaurantProj.y - 12} L ${restaurantProj.x + 4} ${restaurantProj.y - 12} L ${restaurantProj.x} ${restaurantProj.y - 6} Z`} fill="#ef4444" />
            <text x={restaurantProj.x + 10} y={restaurantProj.y + 4} fill="#ef4444" className="text-[9px] font-black font-sans uppercase pointer-events-none select-none drop-shadow-sm">STORE</text>
          </g>
        )}

        {/* Customer Pin */}
        {customerProj && (
          <g className="transition-all duration-300">
            <circle cx={customerProj.x} cy={customerProj.y} r="18" fill="rgba(16, 185, 129, 0.25)" className="animate-pulse" />
            <circle cx={customerProj.x} cy={customerProj.y} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            <text x={customerProj.x + 10} y={customerProj.y + 4} fill="#10b981" className="text-[9px] font-black font-sans uppercase pointer-events-none select-none drop-shadow-sm">CUSTOMER</text>
          </g>
        )}

        {/* Driver Pin */}
        {driverProj && (
          <g className="transition-all duration-300">
            <circle cx={driverProj.x} cy={driverProj.y} r="20" fill="rgba(249, 115, 22, 0.25)" />
            <g className="animate-bounce">
              <polygon points={`${driverProj.x},${driverProj.y - 12} ${driverProj.x - 7},${driverProj.y - 2} ${driverProj.x + 7},${driverProj.y - 2}`} fill="#ea580c" stroke="#ffffff" strokeWidth="1" />
              <circle cx={driverProj.x} cy={driverProj.y} r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
            </g>
            <text x={driverProj.x + 10} y={driverProj.y + 4} fill="#ea580c" className="text-[9px] font-black font-sans uppercase pointer-events-none select-none drop-shadow-sm">RIDER (YOU)</text>
          </g>
        )}
      </svg>

      {/* Map Labels & Mini Compass Overlay */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 pointer-events-none flex items-center gap-2 shadow-xs">
        <Compass className="w-4 h-4 text-orange-600 animate-spin" style={{ animationDuration: '20s' }} />
        <span className="text-[11px] font-mono font-bold text-slate-700">PINGZO VECTOR ENGINE v2.1</span>
      </div>

      {interactive && onSelectLocation && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-orange-200 pointer-events-none flex items-center gap-2 shadow-xs">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="text-xs font-sans font-semibold text-slate-700">
            {customerLocation 
              ? "Location set! Click elsewhere to change" 
              : "Click anywhere on the map to set Delivery Location"
            }
          </span>
        </div>
      )}

      {/* Lat/Lng display under hover */}
      {interactive && hoverCoord && (
        <div className="absolute top-3 right-3 bg-slate-900 px-2 py-1 rounded-lg text-[9px] font-mono text-orange-400 pointer-events-none border border-slate-800 shadow-xs">
          LAT: {hoverCoord.lat.toFixed(4)} | LNG: {hoverCoord.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
