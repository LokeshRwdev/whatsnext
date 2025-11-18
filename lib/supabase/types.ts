export type AppUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

export type DriverProfile = {
  id: string;
  full_name: string | null;
  created_at?: string | null;
};
