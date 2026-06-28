import { maritalStatusLabel, professionLabel } from "@/lib/data/profile-options";

type PublicProfileDetailsProps = {
  bio: string | null;
  residence: string | null;
  profession: string | null;
  marital_status: string | null;
  labels: {
    livesIn: string;
    profession: string;
    status: string;
  };
};

export function PublicProfileDetails({
  bio,
  residence,
  profession,
  marital_status,
  labels,
}: PublicProfileDetailsProps) {
  const professionText = professionLabel(profession);
  const maritalText = maritalStatusLabel(marital_status);
  const hasDetails = bio || residence || professionText || maritalText;

  if (!hasDetails) return null;

  return (
    <div className="mx-auto mb-2 max-w-lg rounded-xl border border-slate-700/80 bg-slate-900/50 px-5 py-4 text-left">
      {bio && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{bio}</p>
      )}
      <dl className={`grid gap-2 text-sm ${bio ? "mt-4" : ""}`}>
        {residence && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-500">{labels.livesIn}</dt>
            <dd className="text-slate-200">{residence}</dd>
          </div>
        )}
        {professionText && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-500">{labels.profession}</dt>
            <dd className="text-slate-200">{professionText}</dd>
          </div>
        )}
        {maritalText && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-500">{labels.status}</dt>
            <dd className="text-slate-200">{maritalText}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
