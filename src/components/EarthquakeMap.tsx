import { useRef, useImperativeHandle, forwardRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import type { Earthquake } from "../types/earthquake";
import { Box } from "@mui/material";
import EarthquakeMarker from "./EarthquakeMarker";

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedEarthquakeId: string | null;
  onEarthquakeSelect: (id: string) => void;
}

export interface EarthquakeMapHandle {
  flyToEarthquake: (earthquake: Earthquake) => void;
}

const EarthquakeMap = forwardRef<EarthquakeMapHandle, EarthquakeMapProps>(
  ({ earthquakes, selectedEarthquakeId, onEarthquakeSelect }, ref) => {
    const mapRef = useRef<L.Map | null>(null);
    // Center the map on Turkey
    const center: [number, number] = [39.0, 35.0];
    const zoom = 6;

    useImperativeHandle(ref, () => ({
      flyToEarthquake: (earthquake: Earthquake) => {
        if (mapRef.current) {
          const [lng, lat] = earthquake.geojson.coordinates;
          mapRef.current.setView([lat, lng], 8, { animate: true });
        }
      },
    }));

    return (
      <Box sx={{ width: "100%", height: "500px", position: "relative" }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          whenReady={() => {
            if (mapRef.current) {
              // Map is ready
            }
          }}
          ref={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {earthquakes.map((earthquake) => (
            <EarthquakeMarker
              key={earthquake._id}
              earthquake={earthquake}
              isSelected={earthquake._id === selectedEarthquakeId}
              onClick={() => onEarthquakeSelect(earthquake._id)}
            />
          ))}
        </MapContainer>
      </Box>
    );
  }
);

export default EarthquakeMap;
