import axios from "axios";
import type { EarthquakeResponse } from "../types/earthquake";

const API_URL = "https://api.orhanaydogdu.com.tr/deprem/kandilli/live";

export const getEarthquakes = async (): Promise<EarthquakeResponse> => {
  try {
    const response = await axios.get<EarthquakeResponse>(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching earthquakes:", error);
    throw error;
  }
};
