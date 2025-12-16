import L from 'leaflet';

interface OSRMResponse {
  routes: {
    geometry: string; // encoded polyline
  }[];
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Decodes OSRM/Google encoded polyline string into an array of [lat, lng]
function decodePolyline(str: string, precision?: number): L.LatLngTuple[] {
  var index = 0,
    lat = 0,
    lng = 0,
    coordinates: L.LatLngTuple[] = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision || 5);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = (result & 1 ? ~(result >> 1) : result >> 1);
    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = (result & 1 ? ~(result >> 1) : result >> 1);

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

/**
 * Fetches the driving route between two points using OSRM.
 */
export const getRoadPath = async (start: { lat: number, lng: number }, end: { lat: number, lng: number }): Promise<L.LatLngTuple[]> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;
    const response = await fetch(url);
    const data: OSRMResponse = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return decodePolyline(data.routes[0].geometry);
    }
    return [[start.lat, start.lng], [end.lat, end.lng]]; // Fallback to straight line
  } catch (error) {
    console.warn("Routing failed, falling back to straight line", error);
    return [[start.lat, start.lng], [end.lat, end.lng]];
  }
};

/**
 * Geocodes a text query to coordinates using Nominatim (OpenStreetMap).
 */
export const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number; name: string } | null> => {
  try {
    // Bias towards Nairobi using viewbox or country codes if possible, here just general query
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Nairobi")}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MatatuLive-Demo/1.0'
      }
    });
    const data: NominatimResult[] = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0]
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed", error);
    return null;
  }
};

/**
 * Calculates a point along a complex path based on progress (0-1).
 */
export const getPointOnPath = (path: L.LatLngTuple[], progress: number): { lat: number, lng: number, heading: number } => {
  if (!path || path.length < 2) return { lat: 0, lng: 0, heading: 0 };
  
  // Ensure progress is clamped between 0 and 1 to prevent out-of-bounds calculations
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // 1. Calculate total length
  let totalDist = 0;
  const segmentDists: number[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = L.latLng(path[i]);
    const p2 = L.latLng(path[i+1]);
    const d = p1.distanceTo(p2);
    segmentDists.push(d);
    totalDist += d;
  }

  // Handle case where path length is 0 (all points identical)
  if (totalDist === 0) {
    return { lat: path[0][0], lng: path[0][1], heading: 0 };
  }

  // 2. Find target distance
  const targetDist = totalDist * clampedProgress;

  // 3. Find the segment that contains the target distance
  let currentDist = 0;
  for (let i = 0; i < segmentDists.length; i++) {
    const nextDist = currentDist + segmentDists[i];
    
    // Check if we are in this segment or if it's the last segment (handling floating point precision)
    if (targetDist <= nextDist || i === segmentDists.length - 1) {
      // Handle zero-length segment within a path
      if (segmentDists[i] === 0) {
         return { lat: path[i][0], lng: path[i][1], heading: 0 };
      }

      const segmentProgress = (targetDist - currentDist) / segmentDists[i];
      const p1 = path[i];
      const p2 = path[i+1];
      
      const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

      // Calculate heading
      const dy = p2[0] - p1[0];
      const dx = p2[1] - p1[1];
      let heading = Math.atan2(dx, dy) * (180 / Math.PI);
      if (isNaN(heading)) heading = 0;

      return { lat, lng, heading };
    }
    currentDist = nextDist;
  }

  // Fallback
  const last = path[path.length - 1];
  return { lat: last[0], lng: last[1], heading: 0 };
};
