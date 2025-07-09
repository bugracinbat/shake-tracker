import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  Chip,
  Button,
  Collapse,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { Earthquake } from '../types/earthquake';

export interface EarthquakeFilter {
  magnitudeRange: [number, number];
  depthRange: [number, number];
  dateRange: [Date | null, Date | null];
  location: string;
  cities: string[];
  sortBy: 'date' | 'magnitude' | 'depth' | 'distance';
  sortOrder: 'asc' | 'desc';
}

interface EarthquakeFiltersProps {
  earthquakes: Earthquake[];
  filters: EarthquakeFilter;
  onFiltersChange: (filters: EarthquakeFilter) => void;
  onReset: () => void;
}

const EarthquakeFilters = ({
  earthquakes,
  filters,
  onFiltersChange,
  onReset,
}: EarthquakeFiltersProps) => {
  const [expanded, setExpanded] = useState(false);

  // Extract unique cities from earthquakes
  const uniqueCities = Array.from(
    new Set(
      earthquakes.map((eq) => eq.location_properties.closestCity.name)
    )
  ).sort();

  const handleMagnitudeChange = (
    _: Event,
    newValue: number | number[]
  ) => {
    onFiltersChange({
      ...filters,
      magnitudeRange: newValue as [number, number],
    });
  };

  const handleDepthChange = (
    _: Event,
    newValue: number | number[]
  ) => {
    onFiltersChange({
      ...filters,
      depthRange: newValue as [number, number],
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: [date, filters.dateRange[1]],
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: [filters.dateRange[0], date],
    });
  };

  const handleLocationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFiltersChange({
      ...filters,
      location: event.target.value,
    });
  };

  const handleCitiesChange = (_: React.SyntheticEvent, newValue: string[]) => {
    onFiltersChange({
      ...filters,
      cities: newValue,
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as EarthquakeFilter['sortBy'],
    });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const activeFiltersCount = [
    filters.magnitudeRange[0] !== 0 || filters.magnitudeRange[1] !== 10,
    filters.depthRange[0] !== 0 || filters.depthRange[1] !== 700,
    filters.dateRange[0] !== null || filters.dateRange[1] !== null,
    filters.location !== '',
    filters.cities.length > 0,
  ].filter(Boolean).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={expanded ? 2 : 0}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="action" />
            <Typography variant="h6">Filters</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={onReset}
              >
                Reset
              </Button>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
            {/* Magnitude Range */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <Typography gutterBottom>
                Magnitude: {filters.magnitudeRange[0].toFixed(1)} -{' '}
                {filters.magnitudeRange[1].toFixed(1)}
              </Typography>
              <Slider
                value={filters.magnitudeRange}
                onChange={handleMagnitudeChange}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                ]}
              />
            </Box>

            {/* Depth Range */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <Typography gutterBottom>
                Depth: {filters.depthRange[0]} - {filters.depthRange[1]} km
              </Typography>
              <Slider
                value={filters.depthRange}
                onChange={handleDepthChange}
                valueLabelDisplay="auto"
                min={0}
                max={700}
                step={10}
                marks={[
                  { value: 0, label: '0' },
                  { value: 350, label: '350' },
                  { value: 700, label: '700' },
                ]}
              />
            </Box>

            {/* Date Range */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <DateTimePicker
                label="Start Date"
                value={filters.dateRange[0]}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <DateTimePicker
                label="End Date"
                value={filters.dateRange[1]}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Box>

            {/* Location Search */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Search Location"
                placeholder="e.g., Turkey, Istanbul"
                value={filters.location}
                onChange={handleLocationChange}
                variant="outlined"
              />
            </Box>

            {/* City Filter */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <Autocomplete
                multiple
                options={uniqueCities}
                value={filters.cities}
                onChange={handleCitiesChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Cities"
                    placeholder="Select cities"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Box>

            {/* Sort Options */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleSortByChange(e.target.value)}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="magnitude">Magnitude</MenuItem>
                  <MenuItem value="depth">Depth</MenuItem>
                  <MenuItem value="distance">Distance</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSortOrderChange}
                sx={{ height: '56px' }}
              >
                Order: {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default EarthquakeFilters;