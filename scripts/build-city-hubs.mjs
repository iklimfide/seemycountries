import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Capital display name -> tourist city list name when they differ. */
const TOURIST_CITY_NAME_OVERRIDES = {
  "Washington, D.C.": "Washington",
};

/** Optional Unsplash hero images per city slug. */
const HERO_IMAGES = {
  paris: {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
    alt: "Paris",
  },
  rome: {
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
    alt: "Rome",
  },
  london: {
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80",
    alt: "London",
  },
  tokyo: {
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80",
    alt: "Tokyo",
  },
  "new-delhi": {
    url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80",
    alt: "New Delhi",
  },
  cairo: {
    url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80",
    alt: "Cairo",
  },
  bangkok: {
    url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80",
    alt: "Bangkok",
  },
  madrid: {
    url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80",
    alt: "Madrid",
  },
  berlin: {
    url: "https://images.unsplash.com/photo-1775045309134-7525be4e2f2d?auto=format&fit=crop&w=400&q=80",
    alt: "Brandenburg Gate, Berlin",
  },
  athens: {
    url: "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=400&q=80",
    alt: "Athens",
  },
  lisbon: {
    url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=400&q=80",
    alt: "Lisbon",
  },
  seoul: {
    url: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=400&q=80",
    alt: "Seoul",
  },
  "mexico-city": {
    url: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=400&q=80",
    alt: "Mexico City",
  },
  "buenos-aires": {
    url: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=400&q=80",
    alt: "Buenos Aires",
  },
  jakarta: {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80",
    alt: "Jakarta",
  },
  hanoi: {
    url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=400&q=80",
    alt: "Hanoi",
  },
  ankara: {
    url: "https://images.unsplash.com/photo-1650802315195-f58a8663c9be?auto=format&fit=crop&w=400&q=80",
    alt: "Ankara",
  },
  canberra: {
    url: "https://images.unsplash.com/photo-1672264597620-d792bb6de88d?auto=format&fit=crop&w=400&q=80",
    alt: "Canberra",
  },
  brasilia: {
    url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=400&q=80",
    alt: "Brasília",
  },
  rabat: {
    url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80",
    alt: "Rabat",
  },
  "washington-d-c": {
    url: "https://images.unsplash.com/photo-1501466044931-62695aada8e9?auto=format&fit=crop&w=400&q=80",
    alt: "Washington, D.C.",
  },
};

function capitalToSlug(capital) {
  return capital
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function loadCountries() {
  return JSON.parse(fs.readFileSync(path.join(root, "data/countries.json"), "utf8")).countries;
}

function main() {
  const countries = loadCountries();
  const cities = {};

  for (const country of Object.values(countries)) {
    const slug = capitalToSlug(country.capital);
    const touristCityName = TOURIST_CITY_NAME_OVERRIDES[country.capital] ?? country.capital;
    const hero = HERO_IMAGES[slug];

    const entry = {
      slug,
      name: country.capital,
      countryCode: country.code,
      countrySlug: country.slug,
      countryName: country.name,
    };

    if (touristCityName !== country.capital) {
      entry.touristCityName = touristCityName;
    }

    if (hero) {
      entry.heroImage = hero.url;
      entry.heroImageAlt = hero.alt;
    }

    cities[slug] = entry;
  }

  const output = {
    cities,
  };

  const outPath = path.join(root, "data/city-hubs.json");
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(cities).length} capital city hubs to data/city-hubs.json`);
}

main();
