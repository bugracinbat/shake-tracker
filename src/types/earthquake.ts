export interface Earthquake {
  _id: string;
  earthquake_id: string;
  provider: string;
  title: string;
  date: string;
  mag: number;
  depth: number;
  geojson: {
    type: string;
    coordinates: [number, number];
  };
  location_properties: {
    closestCity: {
      name: string;
      cityCode: number;
      distance: number;
      population: number;
    };
    epiCenter: {
      name: string;
      cityCode: number;
      population: number | null;
    };
    closestCities: Array<{
      name: string;
      cityCode: number;
      distance: number;
      population: number;
    }>;
    airports: Array<{
      distance: number;
      name: string;
      code: string;
      coordinates: {
        type: string;
        coordinates: [number, number];
      };
    }>;
  };
  rev: string | null;
  date_time: string;
  created_at: number;
  location_tz: string;
}

export interface EarthquakeResponse {
  status: boolean;
  httpStatus: number;
  desc: string;
  serverloadms: number;
  metadata: {
    date_starts: string;
    date_ends: string;
    total: number;
  };
  result: Earthquake[];
}
