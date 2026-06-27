import { getTranslations } from "next-intl/server";
import type { WishlistCountry } from "@/types/database";

type PublicWishlistProps = {
  countries: WishlistCountry[];
};

export async function PublicWishlist({ countries }: PublicWishlistProps) {
  if (countries.length === 0) return null;

  const t = await getTranslations("wishlist");

  return (
    <section className="mt-8 text-center">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
        {t("publicTitle")}
      </h2>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {countries.map((country) => (
          <li
            key={country.id}
            className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-sm text-amber-100"
          >
            {country.country_name}
          </li>
        ))}
      </ul>
    </section>
  );
}
