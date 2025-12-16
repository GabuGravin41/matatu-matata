import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { NAIROBI_ROUTES } from '../constants';
import { Vehicle } from '../types';
import { getRoadPath, getPointOnPath } from '../services/mapService';

interface RouteMapProps {
  vehicles: Vehicle[];
  onVehicleClick: (v: Vehicle) => void;
  selectedRouteId: string | null;
  highlightedRouteIds?: string[];
  tripStart?: { lat: number; lng: number } | null;
  tripEnd?: { lat: number; lng: number } | null;
  tripPath?: L.LatLngTuple[]; // Allow passing a specific user trip path
}

export const RouteMap: React.FC<RouteMapProps> = ({ 
  vehicles, 
  onVehicleClick, 
  selectedRouteId,
  highlightedRouteIds = [],
  tripStart,
  tripEnd,
  tripPath
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  
  // Store the fetched real geometries for route segments so buses can follow them
  const [routeGeometries, setRouteGeometries] = useState<Record<string, L.LatLngTuple[][]>>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-1.286389, 36.817223],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Fetch Real Route Geometries on Mount (for bus movement calculation only)
  useEffect(() => {
    const fetchRoutes = async () => {
      const geometries: Record<string, L.LatLngTuple[][]> = {};

      // Process each route to get real road paths
      for (const route of NAIROBI_ROUTES) {
        const segments: L.LatLngTuple[][] = [];
        for (let i = 0; i < route.stops.length - 1; i++) {
           const start = route.stops[i];
           const end = route.stops[i+1];
           const path = await getRoadPath(start, end);
           segments.push(path);
        }
        geometries[route.id] = segments;
      }
      setRouteGeometries(geometries);
    };

    fetchRoutes();
  }, []);

  // Update Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw User Trip Path (Only show lines when a user actually plans a trip)
    if (tripPath && tripPath.length > 0) {
      // Outer glow
      L.polyline(tripPath, {
        color: '#3b82f6', // Blue-500
        weight: 8,
        opacity: 0.4,
        lineCap: 'round'
      }).addTo(layerGroup);
      
      // Core line
      L.polyline(tripPath, {
        color: '#60a5fa', // Blue-400
        weight: 4,
        opacity: 1,
        dashArray: '10, 10'
      }).addTo(layerGroup);
    }

    // 2. Draw Vehicles (Snapped to Real Road Geometry)
    vehicles.forEach(vehicle => {
      const route = NAIROBI_ROUTES.find(r => r.id === vehicle.routeId);
      if (!route) return;

      const isRouteVisible = (highlightedRouteIds.length === 0 || highlightedRouteIds.includes(vehicle.routeId));
      if (selectedRouteId && selectedRouteId !== vehicle.routeId) return;
      // If we are filtering, hide others. If no filter, show all.
      if (!isRouteVisible) return;

      // Calculate Position on Real Road using fetched geometries
      const segments = routeGeometries[vehicle.routeId];
      let lat = 0, lng = 0, rotation = 0;

      if (segments && segments[vehicle.currentStopIndex]) {
        // We have real road data for this segment
        const segmentPath = segments[vehicle.currentStopIndex];
        const point = getPointOnPath(segmentPath, vehicle.progress / 100);
        lat = point.lat;
        lng = point.lng;
        rotation = point.heading;
      } else {
        // Fallback: Straight line interpolation (only if API fails or loading)
        const currentStop = route.stops[vehicle.currentStopIndex];
        const nextStop = route.stops[vehicle.currentStopIndex + 1] || currentStop;
        lat = currentStop.lat + (nextStop.lat - currentStop.lat) * (vehicle.progress / 100);
        lng = currentStop.lng + (nextStop.lng - currentStop.lng) * (vehicle.progress / 100);
      }

      // Check for valid coordinates to prevent Leaflet errors
      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      // Bus Icon
      const busIcon = L.divIcon({
        className: 'bg-transparent',
        html: `
          <div style="
            transform: rotate(${rotation}deg); 
            transition: transform 0.3s linear;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background-color: ${route.color};
              width: 18px;
              height: 28px;
              border-radius: 4px;
              border: 1.5px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              position: relative;
            ">
              <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.3); margin-top: 3px;"></div>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([lat, lng], { icon: busIcon }).addTo(layerGroup);
      marker.bindTooltip(`${vehicle.sacco} (${vehicle.etaMinutes}m)`, {
        direction: 'top',
        offset: [0, -10],
        className: 'bg-slate-900 text-white border border-slate-700 px-2 py-1 rounded text-xs font-bold'
      });
      marker.on('click', () => onVehicleClick(vehicle));
    });

    // 3. Trip Start/End Markers
    if (tripStart) {
      L.marker([tripStart.lat, tripStart.lng], {
        icon: L.divIcon({
          className: 'bg-transparent',
          html: `<div class="flex flex-col items-center">
                   <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   <div class="w-0.5 h-3 bg-blue-500/50"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20] // Anchor at bottom of line
        })
      }).addTo(layerGroup);
    }

    if (tripEnd) {
      L.marker([tripEnd.lat, tripEnd.lng], {
        icon: L.divIcon({
          className: 'bg-transparent',
          html: `<div class="flex flex-col items-center">
                   <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   <div class="w-0.5 h-3 bg-green-500/50"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20]
        })
      }).addTo(layerGroup);
    }

    // 4. Fit Bounds
    if (tripStart || tripEnd || tripPath) {
       const bounds = L.latLngBounds([]);
       let hasBounds = false;

       if (tripStart) { bounds.extend([tripStart.lat, tripStart.lng]); hasBounds = true; }
       if (tripEnd) { bounds.extend([tripEnd.lat, tripEnd.lng]); hasBounds = true; }
       
       if (tripPath && tripPath.length > 0) {
         tripPath.forEach(p => bounds.extend(p));
         hasBounds = true;
       }

       if (hasBounds) {
         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
       }
    }

  }, [vehicles, selectedRouteId, highlightedRouteIds, tripStart, tripEnd, tripPath, routeGeometries]);

  return (
    <div className="relative w-full h-full bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl group border border-slate-800">
       <div ref={mapContainerRef} className="w-full h-full z-0" />
       
       {selectedRouteId && (
         <div className="absolute bottom-6 left-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-xl z-[1000] pointer-events-none">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">
                  {NAIROBI_ROUTES.find(r => r.id === selectedRouteId)?.name}
                </h3>
                <p className="text-sm text-slate-400">
                  <span className="text-green-400 font-bold">Live Tracking Active</span>
                </p>
              </div>
            </div>
         </div>
      )}
    </div>
  );
};
