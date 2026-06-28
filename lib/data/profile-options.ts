export const PROFESSION_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "software_developer", label: "Software developer" },
  { value: "designer", label: "Designer" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "healthcare", label: "Healthcare" },
  { value: "engineer", label: "Engineer" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "hospitality", label: "Hospitality & tourism" },
  { value: "freelancer", label: "Freelancer" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "single", label: "Single" },
  { value: "in_relationship", label: "In a relationship" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;

export function professionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return PROFESSION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function maritalStatusLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return MARITAL_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
