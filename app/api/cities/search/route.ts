import { NextResponse } from "next/server";
import { searchCitiesInCountries, type CountryRef } from "@/lib/utils/geocode";
import { createClient } from "@/lib/supabase/server";

function parseCountriesParam(raw: string): CountryRef[] {
  return raw
    .split(",")
    .map((part) => {
      const [code, ...nameParts] = part.split("|");
      const name = decodeURIComponent(nameParts.join("|")).trim();
      if (!code || code.length !== 2 || !name) {
        return null;
      }
      return { code: code.toUpperCase(), name };
    })
    .filter((item): item is CountryRef => item !== null);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const countriesParam = searchParams.get("countries");
  const country = searchParams.get("country")?.toUpperCase();
  const countryName = searchParams.get("country_name")?.trim();

  let countries: CountryRef[] = [];

  if (countriesParam) {
    countries = parseCountriesParam(countriesParam);
  } else if (country && country.length === 2 && countryName) {
    countries = [{ code: country, name: countryName }];
  }

  if (countries.length === 0) {
    return NextResponse.json({ error: "No countries specified" }, { status: 400 });
  }

  if (q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  const cities = await searchCitiesInCountries(q, countries);

  return NextResponse.json({ cities });
}
