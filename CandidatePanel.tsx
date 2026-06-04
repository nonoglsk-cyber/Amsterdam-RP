/**
 * Types partagés pour la plateforme de recrutement GTA V RP.
 */

export type StaffRole = 'user' | 'modo' | 'admin' | 'gerant' | 'fondation';

export interface User {
  id: string; // ID Discord
  username: string;
  avatar: string | null;
  role: StaffRole;
  joinedAt: string;
  isOnline?: boolean;
}

export interface Comment {
  id: string;
  staffId: string;
  staffUsername: string;
  content: string;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'reading' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  pseudoRoblox: string;
  pseudoDiscord: string;
  age: number;
  fuseauHoraire: string;
  disponibilites: string[]; // e.g., ["Lundi", "Mardi"...]
  experienceStaff: string; // Q6
  connaissanceCommandes: string; // Q7
  significationHrp: string; // Q10
  pourquoiRejoindre: string; // Q8
  comportementPerturbateur: string; // Q9
  comportementInapproprieMpj: string; // Q11
  luReglement: boolean; // Q12
  status: ApplicationStatus;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ModerationLog {
  id: string;
  action: string;
  staffId: string;
  staffUsername: string;
  targetId: string | null;
  targetUsername: string | null;
  timestamp: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  reading: number;
  accepted: number;
  rejected: number;
  modoCount: number;
  adminCount: number;
  gerantCount: number;
  fondationCount: number;
}
