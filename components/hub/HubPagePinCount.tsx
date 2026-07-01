type HubPagePinCountProps = {
  label: string;
};

export function HubPagePinCount({ label }: HubPagePinCountProps) {
  return <p className="city-page__pin-count">{label}</p>;
}
