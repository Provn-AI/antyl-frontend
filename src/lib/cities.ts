export interface CityOption {
  value: string; // canonical spelling — this exact string is what gets stored in the DB
  label: string; // what's shown in the dropdown (same as value here, kept separate in case you want to localize later)
}

export const CITIES: CityOption[] = [
  { value: "Bengaluru", label: "Bengaluru" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Chennai", label: "Chennai" },
  { value: "Pune", label: "Pune" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Ahmedabad", label: "Ahmedabad" },
  { value: "Noida", label: "Noida" },
  { value: "Gurugram", label: "Gurugram" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Kochi", label: "Kochi" },
  { value: "Indore", label: "Indore" },
];

export const CITY_VALUES: string[] = CITIES.map((c) => c.value);

export function isValidCity(value: string): boolean {
  return CITY_VALUES.includes(value);
}