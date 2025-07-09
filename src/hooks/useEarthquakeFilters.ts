import { useMemo, useState, useCallback } from 'react';
import type { Earthquake } from '../types/earthquake';
import type { EarthquakeFilter } from '../components/EarthquakeFilters';

const defaultFilters: EarthquakeFilter = {
  magnitudeRange: [0, 10],
  depthRange: [0, 700],
  dateRange: [null, null],
  location: '',
  cities: [],
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useEarthquakeFilters = (earthquakes: Earthquake[]) => {
  const [filters, setFilters] = useState<EarthquakeFilter>(defaultFilters);

  const filteredAndSortedEarthquakes = useMemo(() => {
    let filtered = [...earthquakes];

    // Apply magnitude filter
    filtered = filtered.filter(
      (eq) =>
        eq.mag >= filters.magnitudeRange[0] &&
        eq.mag <= filters.magnitudeRange[1]
    );

    // Apply depth filter
    filtered = filtered.filter(
      (eq) =>
        eq.depth >= filters.depthRange[0] && eq.depth <= filters.depthRange[1]
    );

    // Apply date range filter
    if (filters.dateRange[0] || filters.dateRange[1]) {
      filtered = filtered.filter((eq) => {
        const eqDate = new Date(eq.date_time);
        if (filters.dateRange[0] && eqDate < filters.dateRange[0]) {
          return false;
        }
        if (filters.dateRange[1] && eqDate > filters.dateRange[1]) {
          return false;
        }
        return true;
      });
    }

    // Apply location search
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      filtered = filtered.filter(
        (eq) =>
          eq.title.toLowerCase().includes(searchTerm) ||
          eq.location_properties.closestCity.name
            .toLowerCase()
            .includes(searchTerm) ||
          eq.location_properties.epiCenter.name
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    // Apply city filter
    if (filters.cities.length > 0) {
      filtered = filtered.filter((eq) =>
        filters.cities.includes(eq.location_properties.closestCity.name)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison =
            new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
          break;
        case 'magnitude':
          comparison = b.mag - a.mag;
          break;
        case 'depth':
          comparison = b.depth - a.depth;
          break;
        case 'distance':
          comparison =
            a.location_properties.closestCity.distance -
            b.location_properties.closestCity.distance;
          break;
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [earthquakes, filters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const updateFilters = useCallback((newFilters: EarthquakeFilter) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    filteredEarthquakes: filteredAndSortedEarthquakes,
    updateFilters,
    resetFilters,
  };
};