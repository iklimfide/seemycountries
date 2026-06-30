import Image from "next/image";

type ProfileHeroCoverProps = {
  coverUrl: string | null;
  residence: string | null;
  heroTitle: string;
  heroSubtitle: string;
};

export function ProfileHeroCover({
  coverUrl,
  residence,
  heroTitle,
  heroSubtitle,
}: ProfileHeroCoverProps) {
  return (
    <header className="profile-hero">
      <div className="profile-hero-card">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="profile-hero-cover-image"
          />
        ) : null}
        <div className="profile-hero-overlay" aria-hidden />

        <div className="profile-hero-top">
          {residence ? (
            <div className="profile-city-pill">
              <span aria-hidden>📍</span>
              <span>{residence}</span>
            </div>
          ) : (
            <span />
          )}
        </div>

        <div className="profile-hero-title">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>

        <div className="profile-route-line" aria-hidden />
        <div className="profile-route-dot profile-route-dot--one" aria-hidden />
        <div className="profile-route-dot profile-route-dot--two" aria-hidden />
        <div className="profile-route-dot profile-route-dot--three" aria-hidden />
      </div>
    </header>
  );
}
