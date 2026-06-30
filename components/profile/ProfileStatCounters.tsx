type ProfileStatCountersProps = {
  countries: number;
  cities: number;
  nationalParks: number;
  themeParks: number;
  countriesLabel: string;
  citiesLabel: string;
  nationalParksLabel: string;
  themeParksLabel: string;
};

export function ProfileStatCounters({
  countries,
  cities,
  nationalParks,
  themeParks,
  countriesLabel,
  citiesLabel,
  nationalParksLabel,
  themeParksLabel,
}: ProfileStatCountersProps) {
  return (
    <div className="profile-stats">
      <div className="profile-stat">
        <strong>{countries}</strong>
        <span>{countriesLabel}</span>
      </div>
      <div className="profile-stat">
        <strong>{cities}</strong>
        <span>{citiesLabel}</span>
      </div>
      <div className="profile-stat">
        <strong>{nationalParks}</strong>
        <span>{nationalParksLabel}</span>
      </div>
      <div className="profile-stat">
        <strong>{themeParks}</strong>
        <span>{themeParksLabel}</span>
      </div>
    </div>
  );
}
