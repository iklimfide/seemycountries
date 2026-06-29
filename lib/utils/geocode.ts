const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const PHOTON_BASE = "https://photon.komoot.io/api";
const USER_AGENT = "TravelerPin/1.0 (https://travelerpin.com)";

const SEARCH_PLACE_TYPES = new Set(["city", "town", "municipality"]);

type NominatimItem = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type: string;
  placeClass: string;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
  };
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    osm_value: string;
    name: string;
    countrycode?: string;
    state?: string;
    county?: string;
    city?: string;
  };
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
};

export type CitySearchResult = {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
};

export type CountryRef = {
  code: string;
  name: string;
};

function nominatimHeaders(): HeadersInit {
  return {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    "Accept-Language": "en",
  };
}

function normalizeCityName(name: string): string {
  return name
    .replace(/\s+City Municipality$/i, "")
    .replace(/\s+Municipality$/i, "")
    .replace(/\s+City$/i, "")
    .replace(/\s+Province$/i, "")
    .trim();
}

function nameMatchesPrefix(name: string, query: string): boolean {
  const normalized = normalizeCityName(name).toLowerCase();
  const q = query.toLowerCase();
  if (normalized.startsWith(q)) {
    return true;
  }
  return normalized.split(/\s+/).some((word) => word.startsWith(q));
}

function isRelevantNominatim(item: NominatimItem): boolean {
  if (item.placeClass === "place") {
    return SEARCH_PLACE_TYPES.has(item.type);
  }
  if (item.placeClass === "boundary" && item.type === "administrative") {
    const name = item.name ?? "";
    if (/province$/i.test(name)) {
      return false;
    }
    return /city|municipality/i.test(name);
  }
  return false;
}

function pickNominatimSubtitle(item: NominatimItem): string {
  const address = item.address;
  if (!address) return "";

  const parts: string[] = [];
  if (address.town && address.town !== item.name) parts.push(address.town);
  if (address.municipality && address.municipality !== item.name) {
    parts.push(address.municipality);
  }
  if (address.city && address.city !== item.name) parts.push(address.city);

  return parts.slice(0, 2).join(", ");
}

function nominatimToResult(
  item: NominatimItem,
  countryCode: string,
  countryName: string,
  showCountryInSubtitle: boolean
): CitySearchResult | null {
  const latitude = Number.parseFloat(item.lat);
  const longitude = Number.parseFloat(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const name = pickNominatimName(item);
  let subtitle = pickNominatimSubtitle(item);
  if (showCountryInSubtitle) {
    subtitle = subtitle ? `${subtitle} · ${countryName}` : countryName;
  }

  return {
    id: `${countryCode}-nominatim-${item.place_id}`,
    name,
    subtitle,
    latitude,
    longitude,
    country_code: countryCode,
    country_name: countryName,
  };
}

async function searchCitiesViaNominatim(
  query: string,
  countries: CountryRef[],
  limit: number
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || countries.length === 0) {
    return [];
  }

  const allowed = new Set(countries.map((c) => c.code.toUpperCase()));
  const nameByCode = new Map(countries.map((c) => [c.code.toUpperCase(), c.name]));
  const showCountry = countries.length > 1;
  const results: CitySearchResult[] = [];

  for (const country of countries) {
    const params = new URLSearchParams({
      q: trimmed,
      countrycodes: country.code.toLowerCase(),
      format: "json",
      addressdetails: "1",
      limit: String(Math.ceil(limit / countries.length) + 4),
    });

    const items = await fetchNominatim(params);
    for (const item of items) {
      if (!isRelevantNominatim(item)) continue;
      const mapped = nominatimToResult(item, country.code.toUpperCase(), country.name, showCountry);
      if (!mapped) continue;
      if (!allowed.has(mapped.country_code)) continue;
      if (!nameMatchesPrefix(mapped.name, trimmed)) continue;
      results.push(mapped);
    }
  }

  return dedupeResults(results, limit);
}

function pickNominatimName(item: NominatimItem): string {
  if (item.name) {
    return normalizeCityName(item.name);
  }

  const raw =
    item.address?.town ??
    item.address?.municipality ??
    item.display_name.split(",")[0]?.trim() ??
    item.display_name;

  return normalizeCityName(raw);
}

function pickPhotonSubtitle(
  properties: PhotonFeature["properties"],
  cityName: string
): string {
  const stateMatchesCity =
    properties.state &&
    normalizeCityName(properties.state).toLowerCase() === cityName.toLowerCase();

  const parts: string[] = [];

  if (properties.state && !stateMatchesCity) {
    parts.push(properties.state);
  }

  if (!stateMatchesCity && properties.county) {
    parts.push(properties.county);
  }

  return parts.slice(0, 2).join(", ");
}

function photonToResult(
  feature: PhotonFeature,
  countryCode: string,
  countryName: string,
  showCountryInSubtitle: boolean
): CitySearchResult | null {
  const { properties, geometry } = feature;
  const [longitude, latitude] = geometry.coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !properties.name) {
    return null;
  }

  const name = normalizeCityName(properties.name);
  let subtitle = pickPhotonSubtitle(properties, name);
  if (showCountryInSubtitle) {
    subtitle = subtitle ? `${subtitle} · ${countryName}` : countryName;
  }

  return {
    id: `${countryCode}-${properties.osm_type}-${properties.osm_id}`,
    name,
    subtitle,
    latitude,
    longitude,
    country_code: countryCode,
    country_name: countryName,
  };
}

function photonRank(feature: PhotonFeature, query: string): number {
  const name = normalizeCityName(feature.properties.name).toLowerCase();
  const q = query.toLowerCase();
  let score = 0;

  if (feature.properties.osm_value === "city") {
    score -= 20;
  } else if (feature.properties.osm_value === "town") {
    score -= 10;
  }

  if (name === q) {
    score -= 50;
  } else if (name.startsWith(q)) {
    score -= 30;
  }

  return score;
}

function isRelevantPhoton(feature: PhotonFeature): boolean {
  const { osm_value, name } = feature.properties;
  const isPlaceType = SEARCH_PLACE_TYPES.has(osm_value);
  const isVillage = /^ban\s/i.test(name);
  const isAdminNoise = /subdistrict|province$/i.test(name);
  return isPlaceType && !isVillage && !isAdminNoise;
}

async function fetchPhoton(query: string, limit: number): Promise<PhotonFeature[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: "en",
  });

  const response = await fetch(`${PHOTON_BASE}/?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  return data.features ?? [];
}

async function fetchPhotonLive(query: string, limit: number): Promise<PhotonFeature[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: "en",
  });

  const response = await fetch(`${PHOTON_BASE}/?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  return data.features ?? [];
}

type RawNominatimItem = Omit<NominatimItem, "placeClass"> & { class: string };

async function fetchNominatim(params: URLSearchParams): Promise<NominatimItem[]> {
  const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: nominatimHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [];
  }

  const raw = (await response.json()) as RawNominatimItem[];
  return raw.map((item) => ({
    place_id: item.place_id,
    lat: item.lat,
    lon: item.lon,
    display_name: item.display_name,
    name: item.name,
    type: item.type,
    placeClass: item.class,
    address: item.address,
  }));
}

async function fetchNominatimLive(params: URLSearchParams): Promise<NominatimItem[]> {
  const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: nominatimHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const raw = (await response.json()) as RawNominatimItem[];
  return raw.map((item) => ({
    place_id: item.place_id,
    lat: item.lat,
    lon: item.lon,
    display_name: item.display_name,
    name: item.name,
    type: item.type,
    placeClass: item.class,
    address: item.address,
  }));
}

function dedupeResults(results: CitySearchResult[], limit: number): CitySearchResult[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();

  return results
    .filter((item) => {
      const key = `${item.country_code}:${item.name.toLowerCase()}`;
      if (seenIds.has(item.id) || seenKeys.has(key)) {
        return false;
      }
      seenIds.add(item.id);
      seenKeys.add(key);
      return true;
    })
    .slice(0, limit);
}

export async function searchCitiesInCountries(
  query: string,
  countries: CountryRef[],
  limit = 12
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || countries.length === 0) {
    return [];
  }

  const allowed = new Set(countries.map((c) => c.code.toUpperCase()));
  const nameByCode = new Map(countries.map((c) => [c.code.toUpperCase(), c.name]));
  const showCountry = countries.length > 1;

  try {
    const features = await fetchPhoton(trimmed, 30);
    const results = features
      .filter((feature) => {
        const code = feature.properties.countrycode?.toUpperCase();
        return code !== undefined && allowed.has(code);
      })
      .filter(isRelevantPhoton)
      .filter((feature) => nameMatchesPrefix(feature.properties.name, trimmed))
      .sort((a, b) => photonRank(a, trimmed) - photonRank(b, trimmed))
      .map((feature) => {
        const code = feature.properties.countrycode!.toUpperCase();
        const countryName = nameByCode.get(code) ?? code;
        return photonToResult(feature, code, countryName, showCountry);
      })
      .filter((item): item is CitySearchResult => item !== null);

    const deduped = dedupeResults(results, limit);
    if (deduped.length > 0) {
      return deduped;
    }
  } catch {
    // Photon unavailable — fall back to Nominatim.
  }

  return searchCitiesViaNominatim(trimmed, countries, limit);
}

export async function searchCities(
  query: string,
  countryCode: string,
  countryName: string,
  limit = 8
): Promise<CitySearchResult[]> {
  return searchCitiesInCountries(query, [{ code: countryCode, name: countryName }], limit);
}

function isGeocodableNominatim(item: NominatimItem, target: string): boolean {
  const name = pickNominatimName(item).toLowerCase();
  const nameMatches =
    name === target || name.startsWith(target) || name.split(/\s+/).some((word) => word.startsWith(target));

  if (item.placeClass === "place") {
    if (SEARCH_PLACE_TYPES.has(item.type)) {
      return true;
    }
    return nameMatches;
  }

  if (item.placeClass === "boundary" && item.type === "administrative") {
    if (/province|region|district|county|department$/i.test(name)) {
      return false;
    }
    return nameMatches;
  }

  return false;
}

function nominatimGeocodeScore(item: NominatimItem, target: string): number {
  const name = pickNominatimName(item).toLowerCase();
  let score = 0;

  if (item.type === "country" || /^(country|state)$/i.test(item.type)) {
    return 10_000;
  }

  if (isRelevantNominatim(item)) {
    score -= 100;
  } else if (item.placeClass === "boundary" && item.type === "administrative") {
    if (/province|region|district|county|department$/i.test(name)) {
      score += 80;
    } else {
      score -= 40;
    }
  } else if (item.placeClass === "place") {
    score -= 20;
  } else {
    score += 50;
  }

  if (name === target) {
    score -= 50;
  } else if (name.startsWith(target)) {
    score -= 30;
  } else if (name.includes(target) || target.includes(name)) {
    score -= 10;
  } else {
    score += 40;
  }

  return score;
}

function pickNominatimGeocode(items: NominatimItem[], query: string): GeocodeResult | null {
  const target = normalizeCityName(query).toLowerCase();
  if (!target) return null;

  const candidates = items
    .filter((item) => isGeocodableNominatim(item, target))
    .map((item) => {
      const latitude = Number.parseFloat(item.lat);
      const longitude = Number.parseFloat(item.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return { item, latitude, longitude, score: nominatimGeocodeScore(item, target) };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.score - b.score);

  const best = candidates[0];
  if (!best || best.score >= 200) {
    return null;
  }

  return {
    latitude: best.latitude,
    longitude: best.longitude,
  };
}

async function geocodeViaPhoton(
  cityName: string,
  countryCode: string,
  countryName: string
): Promise<GeocodeResult | null> {
  const trimmed = cityName.trim();
  const code = countryCode.toUpperCase();
  const target = normalizeCityName(trimmed).toLowerCase();
  const queries = [`${trimmed}, ${countryName}`, trimmed];

  for (const query of queries) {
    try {
      const features = await fetchPhotonLive(query, 20);
      const inCountry = features.filter(
        (feature) =>
          feature.properties.countrycode?.toUpperCase() === code && feature.properties.name
      );

      const ranked = [...inCountry].sort(
        (a, b) => photonRank(a, trimmed) - photonRank(b, trimmed)
      );

      const pick =
        ranked.find(
          (feature) =>
            isRelevantPhoton(feature) &&
            normalizeCityName(feature.properties.name).toLowerCase() === target
        ) ??
        ranked.find(
          (feature) =>
            isRelevantPhoton(feature) && nameMatchesPrefix(feature.properties.name, trimmed)
        );

      if (!pick) continue;

      const [longitude, latitude] = pick.geometry.coordinates;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      return { latitude, longitude };
    } catch {
      // Try the next query variant.
    }
  }

  return null;
}

async function geocodeViaNominatim(
  cityName: string,
  countryCode: string,
  countryName: string
): Promise<GeocodeResult | null> {
  const trimmed = cityName.trim();
  const queries = [`${trimmed}, ${countryName}`, trimmed];

  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      countrycodes: countryCode.toLowerCase(),
      format: "json",
      addressdetails: "1",
      limit: "10",
    });

    const results = await fetchNominatimLive(params);
    const match = pickNominatimGeocode(results, trimmed);
    if (match) return match;
  }

  return null;
}

export async function geocodeCity(
  cityName: string,
  countryCode: string,
  countryName: string
): Promise<GeocodeResult | null> {
  const trimmed = cityName.trim();
  if (!trimmed) return null;

  const target = normalizeCityName(trimmed).toLowerCase();
  const searchResults = await searchCities(trimmed, countryCode, countryName, 8);
  const searchMatch =
    searchResults.find((item) => item.name.toLowerCase() === target) ?? searchResults[0];

  if (searchMatch) {
    return {
      latitude: searchMatch.latitude,
      longitude: searchMatch.longitude,
    };
  }

  const photonMatch = await geocodeViaPhoton(trimmed, countryCode, countryName);
  if (photonMatch) {
    return photonMatch;
  }

  return geocodeViaNominatim(trimmed, countryCode, countryName);
}
