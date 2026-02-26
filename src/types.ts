export interface Profile {
  id: string;
  name: string;
  location: string;
  email: string;
  phone?: string;
  linkedin?: string;
  role: string;
  exp: string;
  skills: string[];
  stage?: string;
  commitment: string;
  industries: string[];
  looking: string;
  bio: string;
  idea?: string;
  createdAt: number;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  city?: string;
  role?: string;
  source?: string;
  looking?: string;
  createdAt: number;
}

export interface Match {
  id: string;
  p1_id: string;
  p2_id: string;
  p1_name?: string;
  p1_role?: string;
  p1_email?: string;
  p1_phone?: string;
  p2_name?: string;
  p2_role?: string;
  p2_email?: string;
  p2_phone?: string;
  notes?: string;
  status: 'pending' | 'introduced' | 'connected';
  createdAt: number;
}

export interface Stats {
  profiles: number;
  matches: number;
  connections: number;
  teamRequests: number;
}

export interface TeamRequest {
  id: string;
  startupName: string;
  contactName: string;
  email: string;
  phone?: string;
  roleNeeded: string;
  description: string;
  budget?: string;
  equity?: string;
  createdAt: number;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  createdAt: number;
  isApproved: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  number: string;
  query: string;
  createdAt: number;
}
