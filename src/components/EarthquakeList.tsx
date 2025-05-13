import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeListProps {
  earthquakes: Earthquake[];
  selectedEarthquakeId: string | null;
  onEarthquakeSelect: (id: string) => void;
}

const EarthquakeList = ({
  earthquakes,
  selectedEarthquakeId,
  onEarthquakeSelect,
}: EarthquakeListProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Magnitude</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Depth (km)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Closest City</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {earthquakes.map((earthquake) => (
            <TableRow
              key={earthquake._id}
              onClick={() => onEarthquakeSelect(earthquake._id)}
              sx={{
                cursor: "pointer",
                backgroundColor:
                  earthquake._id === selectedEarthquakeId
                    ? "rgba(0, 0, 0, 0.04)"
                    : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <TableCell>
                {new Date(earthquake.date_time).toLocaleString()}
              </TableCell>
              <TableCell>{earthquake.title}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor:
                      earthquake.mag >= 4
                        ? "rgba(211, 47, 47, 0.1)"
                        : earthquake.mag >= 3
                        ? "rgba(237, 108, 2, 0.1)"
                        : "rgba(46, 125, 50, 0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        earthquake.mag >= 4
                          ? "error.main"
                          : earthquake.mag >= 3
                          ? "warning.main"
                          : "success.main",
                      fontWeight: 600,
                    }}
                  >
                    {earthquake.mag.toFixed(1)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{earthquake.depth.toFixed(1)}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {earthquake.location_properties.closestCity.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    {Math.round(
                      earthquake.location_properties.closestCity.distance / 1000
                    )}{" "}
                    km away
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EarthquakeList;
