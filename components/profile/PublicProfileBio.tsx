type PublicProfileBioProps = {
  bio: string | null;
};

export function PublicProfileBio({ bio }: PublicProfileBioProps) {
  if (!bio) return null;

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 sm:text-base">
      {bio}
    </p>
  );
}
