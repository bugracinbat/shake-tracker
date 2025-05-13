import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import type { Earthquake } from "../types/earthquake";
import { Box } from "@mui/material";

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
}

const EarthquakeMap = ({ earthquakes }: EarthquakeMapProps) => {
  // Center the map on Turkey
  const center: [number, number] = [39.0, 35.0];
  const zoom = 6;

  const getMarkerColor = (magnitude: number) => {
    if (magnitude >= 4) return "red";
    if (magnitude >= 3) return "orange";
    return "green";
  };

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
        {earthquakes.map((earthquake) => {
          const [longitude, latitude] = earthquake.geojson.coordinates;
          return (
            <Marker
              key={earthquake._id}
              position={[latitude, longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <div>
                  <h3>{earthquake.title}</h3>
                  <p>Magnitude: {earthquake.mag.toFixed(1)}</p>
                  <p>Depth: {earthquake.depth.toFixed(1)} km</p>
                  <p>Date: {new Date(earthquake.date_time).toLocaleString()}</p>
                  <p>
                    Closest City:{" "}
                    {earthquake.location_properties.closestCity.name}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default EarthquakeMap;
