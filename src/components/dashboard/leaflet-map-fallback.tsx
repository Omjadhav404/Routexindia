'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  plate_number: string;
  driver_name: string;
  telemetry_fuel: number;
  status: string;
  operating_hub: string;
}

interface TrackingMapProps {
  selectedVehicle: string;
  vehicles: Vehicle[];
}

const hubs: Record<string, { name: string; coords: [number, number] }> = {
  'North Hub (Delhi)': { name: 'Delhi Hub', coords: [28.6139, 77.2090] },
  'West Hub (Mumbai)': { name: 'Mumbai Hub', coords: [19.0760, 72.8777] },
  'South Hub (Bangalore)': { name: 'Bangalore Hub', coords: [12.9716, 77.5946] },
  'Chennai Hub': { name: 'Chennai Hub', coords: [13.0827, 80.2707] },
  'East Hub (Kolkata)': { name: 'Kolkata Hub', coords: [22.5726, 88.3639] },
  'West Hub (Pune)': { name: 'Pune Hub', coords: [18.5204, 73.8567] }
};

const routePaths: Record<string, { coords: [number, number]; start: [number, number]; end: [number, number] }> = {
  'MH-12-Q-4029': { coords: [15.6, 74.5], start: [12.9716, 77.5946], end: [19.0760, 72.8777] },
  'DL-03-A-9901': { coords: [28.63, 77.22], start: [28.6139, 77.2090], end: [28.5355, 77.3910] },
  'KA-05-M-2210': { coords: [12.93, 79.13], start: [12.9716, 77.5946], end: [13.0827, 80.2707] },
  'MH-04-E-5520': { coords: [19.12, 72.90], start: [19.0760, 72.8777], end: [18.5204, 73.8567] },
  'WB-02-Y-7731': { coords: [22.565, 88.39], start: [22.5726, 88.3639], end: [22.5744, 88.4338] }
};

export default function LeafletMapFallback({ selectedVehicle, vehicles }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet map centered on central India
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([20.5937, 78.9629], 5);

    // Dark Matter tile layer for premium dark look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Draw Hub Markers
    Object.entries(hubs).forEach(([key, hub]) => {
      const hubIcon = L.divIcon({
        html: `<div class="hub-marker-div flex items-center justify-center text-[10px] text-purple-400 bg-slate-900 border-2 border-purple-500 rounded-full w-7 h-7 shadow-[0_0_8px_rgba(139,92,246,0.4)]">🏢</div>`,
        className: 'hub-icon-custom',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker(hub.coords, { icon: hubIcon })
        .addTo(map)
        .bindPopup(`<strong class="text-slate-100">🏢 ${hub.name}</strong><br><span class="text-xs text-slate-400">Active Logistics Hub</span>`);
    });

    // Draw Vehicle Markers
    vehicles.forEach((v) => {
      const pathData = routePaths[v.plate_number];
      if (!pathData) return;

      const vehicleIcon = L.divIcon({
        html: `<div id="marker-icon-${v.plate_number}" class="brutalist-marker flex items-center justify-center text-xs text-white bg-blue-600 border-2 border-slate-100 rounded-full w-8 h-8 shadow-md">🚚</div>`,
        className: 'vehicle-icon-custom',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(pathData.coords, { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`
          <div class="font-mono text-xs w-48 text-slate-200">
            <strong class="text-blue-400 text-sm block border-b border-slate-800 pb-1 mb-1">🚚 ${v.plate_number}</strong>
            <strong>DRIVER:</strong> ${v.driver_name}<br>
            <strong>STATUS:</strong> ${v.status.toUpperCase()}<br>
            <strong>FUEL:</strong> ${v.telemetry_fuel}%<br>
            <strong>HUB:</strong> ${v.operating_hub}
          </div>
        `);

      markersRef.current[v.plate_number] = marker;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [vehicles]);

  // Handle vehicle selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous routing lines
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Clear previous pickup and delivery markers
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
    if (deliveryMarkerRef.current) {
      map.removeLayer(deliveryMarkerRef.current);
      deliveryMarkerRef.current = null;
    }

    const pathData = routePaths[selectedVehicle];
    const marker = markersRef.current[selectedVehicle];

    // Reset styles
    Object.keys(markersRef.current).forEach((plate) => {
      const el = document.getElementById(`marker-icon-${plate}`);
      if (el) {
        el.classList.remove('bg-cyan-500', 'border-cyan-400', 'shadow-[0_0_12px_#06b6d4]');
        el.classList.add('bg-blue-600');
      }
    });

    if (pathData && marker) {
      // Highlight selection icon
      const el = document.getElementById(`marker-icon-${selectedVehicle}`);
      if (el) {
        el.classList.remove('bg-blue-600');
        el.classList.add('bg-cyan-500', 'border-cyan-400', 'shadow-[0_0_12px_#06b6d4]');
      }

      marker.openPopup();

      // Draw Pickup Marker
      const pickupIcon = L.divIcon({
        html: `<div class="flex items-center justify-center text-xs text-white bg-emerald-500 border border-slate-100 rounded-full w-6 h-6 shadow-[0_0_10px_rgba(16,185,129,0.4)] font-bold">P</div>`,
        className: 'pickup-icon-custom',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const pickupMarker = L.marker(pathData.start, { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<strong class="text-slate-100">🟩 Pickup Point</strong><br><span class="text-xs text-slate-400">Consignment cargo source for ${selectedVehicle}</span>`);
      pickupMarkerRef.current = pickupMarker;

      // Draw Delivery Marker
      const deliveryIcon = L.divIcon({
        html: `<div class="flex items-center justify-center text-xs text-white bg-rose-500 border border-slate-100 rounded-full w-6 h-6 shadow-[0_0_10px_rgba(244,63,94,0.4)] font-bold">D</div>`,
        className: 'delivery-icon-custom',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const deliveryMarker = L.marker(pathData.end, { icon: deliveryIcon })
        .addTo(map)
        .bindPopup(`<strong class="text-slate-100">🟥 Delivery Destination</strong><br><span class="text-xs text-slate-400">Consignment cargo target for ${selectedVehicle}</span>`);
      deliveryMarkerRef.current = deliveryMarker;

      // Draw active route path
      const pathPoints = [pathData.start, pathData.coords, pathData.end];
      const polyline = L.polyline(pathPoints, {
        color: '#06b6d4',
        weight: 4,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(map);

      polylineRef.current = polyline;

      // Fit bounds to show route path
      map.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 6,
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedVehicle]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl" />;
}
