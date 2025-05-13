import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeMarkerProps {
  earthquake: Earthquake;
  isSelected: boolean;
  onClick: () => void;
}

const EarthquakeMarker = ({
  earthquake,
  isSelected,
  onClick,
}: EarthquakeMarkerProps) => {
  const markerRef = useRef<L.Marker>(null);
  const [longitude, latitude] = earthquake.geojson.coordinates;

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  const getMarkerSize = (magnitude: number) => {
    if (magnitude >= 4) return 24;
    if (magnitude >= 3) return 20;
    return 16;
  };

  const getMarkerColor = (magnitude: number) => {
    if (magnitude >= 4) return "#d32f2f";
    if (magnitude >= 3) return "#ed6c02";
    return "#2e7d32";
  };

  const createCustomIcon = () => {
    const size = getMarkerSize(earthquake.mag);
    const color = getMarkerColor(earthquake.mag);

    return new DivIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size * 0.4}px;
          transform: translate(-50%, -50%);
          ${isSelected ? "animation: pulse 1.5s infinite;" : ""}
        ">
          ${earthquake.mag.toFixed(1)}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <Marker
      ref={markerRef}
      position={[latitude, longitude]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div>
          <h3>{earthquake.title}</h3>
          <p>Magnitude: {earthquake.mag.toFixed(1)}</p>
          <p>Depth: {earthquake.depth.toFixed(1)} km</p>
          <p>Date: {new Date(earthquake.date_time).toLocaleString()}</p>
          <p>Closest City: {earthquake.location_properties.closestCity.name}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default EarthquakeMarker;
