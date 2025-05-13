import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeListProps {
  earthquakes: Earthquake[];
}

const EarthquakeList = ({ earthquakes }: EarthquakeListProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Magnitude</TableCell>
            <TableCell>Depth (km)</TableCell>
            <TableCell>Closest City</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {earthquakes.map((earthquake) => (
            <TableRow key={earthquake._id}>
              <TableCell>
                {new Date(earthquake.date_time).toLocaleString()}
              </TableCell>
              <TableCell>{earthquake.title}</TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color:
                      earthquake.mag >= 4
                        ? "error.main"
                        : earthquake.mag >= 3
                        ? "warning.main"
                        : "success.main",
                    fontWeight: "bold",
                  }}
                >
                  {earthquake.mag.toFixed(1)}
                </Typography>
              </TableCell>
              <TableCell>{earthquake.depth.toFixed(1)}</TableCell>
              <TableCell>
                {earthquake.location_properties.closestCity.name}
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {Math.round(
                    earthquake.location_properties.closestCity.distance / 1000
                  )}{" "}
                  km away
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EarthquakeList;
