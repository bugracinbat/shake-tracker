import { MapContainer, TileLayer } from "react-leaflet";
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

const EarthquakeMap = ({
  earthquakes,
  selectedEarthquakeId,
  onEarthquakeSelect,
}: EarthquakeMapProps) => {
  // Center the map on Turkey
  const center: [number, number] = [39.0, 35.0];
  const zoom = 6;

  return (
    <Box sx={{ width: "100%", height: "500px", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
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
};

export default EarthquakeMap;
