export type Role = 'USER' | 'ADMIN';

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  referralCode: string;
  referredById: string | null;
  createdAt: string;
  updatedAt: string;
}
