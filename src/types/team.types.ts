import type { User } from './user.types';

export type TeamRole = 'TeamLead' | 'Member';

export interface TeamMember {
  userId: User | string; // populated or ID
  role: TeamRole;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
}
