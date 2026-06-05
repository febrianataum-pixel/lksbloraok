import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Globe } from "lucide-react";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
  readOnly?: boolean;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  height = "h-[300px]",
  readOnly = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLReady, setIsLReady] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if ((window as any).L) {
      setIsLReady(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    cssLink.id = "leaflet-css";
    document.head.appendChild(cssLink);

    const jsScript = document.createElement("script");
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    jsScript.id = "leaflet-js";
    jsScript.onload = () => {
      setIsLReady(true);
    };
    document.body.appendChild(jsScript);

    return () => {
      // Keep css/js for transitions to avoid refetch, but detach handlers
    };
  }, []);

  // Initialize and update Map structure
  useEffect(() => {
    if (!isLReady || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapRef.current) {
      // Create Map
      mapRef.current = L.map(mapContainerRef.current, {
        center: [latitude || -7.02, longitude || 111.41],
        zoom: 12,
        zoomControl: !readOnly,
        dragging: !readOnly,
        touchZoom: !readOnly,
        scrollWheelZoom: false,
      });

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>'
      }).addTo(mapRef.current);

      // Add Marker
      markerRef.current = L.marker([latitude || -7.02, longitude || 111.41], {
        draggable: !readOnly
      }).addTo(mapRef.current);

      // Listen to dragend on marker
      if (!readOnly) {
        markerRef.current.on("dragend", () => {
          const position = markerRef.current.getLatLng();
          onChange(
            parseFloat(position.lat.toFixed(6)),
            parseFloat(position.lng.toFixed(6))
          );
        });

        // Listen to map click
        mapRef.current.on("click", (e: any) => {
          const latLng = e.latlng;
          markerRef.current.setLatLng(latLng);
          onChange(
            parseFloat(latLng.lat.toFixed(6)),
            parseFloat(latLng.lng.toFixed(6))
          );
        });
      }
    } else {
      // Map is already initialized, update marker position
      const latLng = [latitude || -7.02, longitude || 111.41];
      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      }
      if (mapRef.current) {
        mapRef.current.setView(latLng);
      }
    }
  }, [isLReady, latitude, longitude, readOnly]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Fitur GPS Geolokasi tidak didukung oleh browser Anda.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        onChange(lat, lng);
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Gagal mengambil posisi GPS. Pastikan izin lokasi aktif.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-50">
        <div ref={mapContainerRef} className={`${height} w-full`} />

        {!isLReady && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
            <Compass className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-slate-500 font-mono">Memuat peta interaktif...</span>
          </div>
        )}

        {!readOnly && (
          <div className="absolute top-2.5 right-2.5 z-[1000] flex flex-col gap-2">
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-md border border-slate-200 transition-colors disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${gpsLoading ? "animate-pulse" : "circle"}`} />
              {gpsLoading ? "Mengambil GPS..." : "Gunakan GPS Saat Ini"}
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display mb-1">
              Latitude
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">LAT</span>
              <input
                type="number"
                step="0.000001"
                value={latitude || ""}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0, longitude)}
                className="w-full pl-11 pr-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-800 font-mono shadow-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                placeholder="-7.02345"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display mb-1">
              Longitude
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">LNG</span>
              <input
                type="number"
                step="0.000001"
                value={longitude || ""}
                onChange={(e) => onChange(latitude, parseFloat(e.target.value) || 0)}
                className="w-full pl-11 pr-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-800 font-mono shadow-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                placeholder="111.4134"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MapPicker;
