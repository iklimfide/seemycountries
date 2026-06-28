const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const PHOTON_BASE = "https://photon.komoot.io/api";
const USER_AGENT = "SeeMyCountries/1.0 (https://seemycountries.com)";

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

export async function geocodeCity(
  cityName: string,
  countryCode: string,
  countryName: string
): Promise<GeocodeResult | null> {
  const photonResults = await searchCities(cityName, countryCode, countryName, 5);
  const target = normalizeCityName(cityName).toLowerCase();

  const photonMatch =
    photonResults.find((item) => item.name.toLowerCase() === target) ?? photonResults[0];

  if (photonMatch) {
    return {
      latitude: photonMatch.latitude,
      longitude: photonMatch.longitude,
    };
  }

  const params = new URLSearchParams({
    q: `${cityName}, ${countryName}`,
    countrycodes: countryCode.toLowerCase(),
    format: "json",
    addressdetails: "1",
    limit: "5",
  });

  const results = await fetchNominatim(params);
  const match = results
    .filter(isRelevantNominatim)
    .map((item) => {
      const latitude = Number.parseFloat(item.lat);
      const longitude = Number.parseFloat(item.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return {
        name: pickNominatimName(item),
        latitude,
        longitude,
      };
    })
    .filter(
      (item): item is { name: string; latitude: number; longitude: number } => item !== null
    )
    .sort((a, b) => {
      if (a.name.toLowerCase() === target && b.name.toLowerCase() !== target) {
        return -1;
      }
      if (b.name.toLowerCase() === target && a.name.toLowerCase() !== target) {
        return 1;
      }
      return 0;
    })[0];

  if (!match) {
    return null;
  }

  return {
    latitude: match.latitude,
    longitude: match.longitude,
  };
}
