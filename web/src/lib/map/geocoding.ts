export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Geocode a city name using Nominatim (OpenStreetMap).
 *
 * NOTE: Nominatim enforces a rate limit of 1 request per second.
 * Callers should debounce or throttle invocations accordingly.
 */
export async function geocodeCity(
  city: string,
  country: string,
): Promise<GeocodingResult> {
  const query = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MapPosterWeb/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Geocoding request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `No geocoding results found for "${city}, ${country}"`,
    );
  }

  const result = data[0] as {
    lat: string;
    lon: string;
    display_name: string;
  };

  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(
      `Invalid coordinates returned for "${city}, ${country}": lat=${result.lat}, lon=${result.lon}`,
    );
  }

  return {
    lat,
    lon,
    displayName: result.display_name,
  };
}
