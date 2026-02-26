import { Profile, WaitlistEntry, Match, Stats, TeamRequest, Review, ContactMessage } from "./types";
import { db } from "./lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc, 
  updateDoc,
  getDoc,
  where,
  getCountFromServer
} from "firebase/firestore";

export const api = {
  async getStats(isAdmin: boolean = false): Promise<Stats> {
    const profilesColl = collection(db, "profiles");
    const matchesColl = collection(db, "matches");
    const teamRequestsQuery = query(collection(db, "waitlist"), where("type", "==", "team_request"));
    const connectionsQuery = query(collection(db, "matches"), where("status", "==", "connected"));

    const getCount = async (coll: any, isSensitive: boolean = false) => {
      if (isSensitive && !isAdmin) return 0;
      try {
        const snap = await getCountFromServer(coll);
        return snap.data().count;
      } catch (e: any) {
        // Only log if it's not a permission error or if we expected to have access
        if (e.code !== 'permission-denied') {
          console.error("Error fetching count:", e);
        }
        return 0;
      }
    };

    const [profiles, matches, connections, teamRequests] = await Promise.all([
      getCount(profilesColl),
      getCount(matchesColl),
      getCount(connectionsQuery),
      getCount(teamRequestsQuery, true)
    ]);

    return {
      profiles,
      matches,
      connections,
      teamRequests
    };
  },

  async getProfiles(): Promise<Profile[]> {
    const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Profile));
  },

  async getProfile(id: string): Promise<Profile | null> {
    const snap = await getDoc(doc(db, "profiles", id));
    return snap.exists() ? (snap.data() as Profile) : null;
  },

  async createProfile(profile: Profile): Promise<void> {
    await setDoc(doc(db, "profiles", profile.id), profile);
  },

  async deleteProfile(id: string): Promise<void> {
    await deleteDoc(doc(db, "profiles", id));
  },

  async getWaitlist(): Promise<WaitlistEntry[]> {
    try {
      const q = query(
        collection(db, "waitlist"), 
        where("type", "==", "waitlist"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as WaitlistEntry));
    } catch (e) {
      console.warn("Waitlist query failed, falling back to client-side filtering", e);
      const q2 = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q2);
      return snap.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as any))
        .filter(doc => doc.type === 'waitlist' || !doc.type);
    }
  },

  async joinWaitlist(entry: WaitlistEntry): Promise<void> {
    await setDoc(doc(db, "waitlist", entry.id), {
      ...entry,
      type: 'waitlist'
    });
  },

  async deleteWaitlist(id: string): Promise<void> {
    await deleteDoc(doc(db, "waitlist", id));
  },

  async getMatches(): Promise<Match[]> {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const matches = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match));
    
    // In a real app, we'd denormalize or fetch profiles. 
    // For simplicity here, we'll fetch profiles for each match if names are missing.
    // But better to store them in the match doc.
    return matches;
  },

  async createMatch(p1_id: string, p2_id: string, notes?: string): Promise<void> {
    // Fetch profile info to denormalize (as the previous SQL join did)
    const [p1Snap, p2Snap] = await Promise.all([
      getDoc(doc(db, "profiles", p1_id)),
      getDoc(doc(db, "profiles", p2_id))
    ]);

    const p1 = p1Snap.data() as Profile;
    const p2 = p2Snap.data() as Profile;

    const id = Date.now().toString();
    const matchData: Match = {
      id,
      p1_id,
      p2_id,
      p1_name: p1.name,
      p1_role: p1.role,
      p1_email: p1.email,
      p1_phone: p1.phone,
      p2_name: p2.name,
      p2_role: p2.role,
      p2_email: p2.email,
      p2_phone: p2.phone,
      notes,
      status: 'pending',
      createdAt: Date.now()
    };

    await setDoc(doc(db, "matches", id), matchData);
  },

  async updateMatchStatus(id: string, status: string): Promise<void> {
    await updateDoc(doc(db, "matches", id), { status });
  },

  async deleteMatch(id: string): Promise<void> {
    await deleteDoc(doc(db, "matches", id));
  },

  async getUserMatches(userId: string): Promise<Match[]> {
    const q1 = query(collection(db, "matches"), where("p1_id", "==", userId));
    const q2 = query(collection(db, "matches"), where("p2_id", "==", userId));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const matches1 = snap1.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match));
    const matches2 = snap2.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match));
    
    return [...matches1, ...matches2].sort((a, b) => b.createdAt - a.createdAt);
  },

  async getReviews(onlyApproved: boolean = true): Promise<Review[]> {
    try {
      const q = query(
        collection(db, "waitlist"), 
        where("type", "==", "review"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const reviews = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
      return onlyApproved ? reviews.filter(r => r.isApproved) : reviews;
    } catch (e) {
      console.warn("Reviews query failed, falling back to client-side filtering", e);
      const q2 = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q2);
      const all = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      const reviews = all.filter(doc => doc.type === 'review') as Review[];
      return onlyApproved ? reviews.filter(r => r.isApproved) : reviews;
    }
  },

  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Promise<void> {
    try {
      const newDocRef = doc(collection(db, "waitlist"));
      await setDoc(newDocRef, {
        ...review,
        id: newDocRef.id,
        type: 'review',
        isApproved: false, // Default to unapproved for safety
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  async approveReview(id: string): Promise<void> {
    await updateDoc(doc(db, "waitlist", id), { isApproved: true });
  },

  async deleteReview(id: string): Promise<void> {
    await deleteDoc(doc(db, "waitlist", id));
  },

  async adminLogin(password: string): Promise<boolean> {
    // Simple client-side check as requested before, or we could use a function.
    // Keeping it simple for now.
    return password === "shivapal";
  },

  async getTeamRequests(): Promise<TeamRequest[]> {
    try {
      const q = query(
        collection(db, "waitlist"), 
        where("type", "==", "team_request"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeamRequest));
    } catch (e) {
      console.warn("Team requests query failed, falling back to client-side filtering", e);
      const q2 = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q2);
      return snap.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as any))
        .filter(doc => doc.type === 'team_request') as TeamRequest[];
    }
  },

  async createTeamRequest(request: Omit<TeamRequest, 'id'>): Promise<void> {
    try {
      const newDocRef = doc(collection(db, "waitlist"));
      await setDoc(newDocRef, {
        ...request,
        id: newDocRef.id,
        type: 'team_request',
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error creating team request:", error);
      throw error;
    }
  },

  async deleteTeamRequest(id: string): Promise<void> {
    await deleteDoc(doc(db, "waitlist", id));
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const q = query(
        collection(db, "waitlist"), 
        where("type", "==", "contact"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContactMessage));
    } catch (e) {
      console.warn("Contact messages query failed, falling back to client-side filtering", e);
      const q2 = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q2);
      return snap.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as any))
        .filter(doc => doc.type === 'contact') as ContactMessage[];
    }
  },

  async createContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<void> {
    try {
      const newDocRef = doc(collection(db, "waitlist"));
      await setDoc(newDocRef, {
        ...message,
        id: newDocRef.id,
        type: 'contact',
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error creating contact message:", error);
      throw error;
    }
  },

  async deleteContactMessage(id: string): Promise<void> {
    await deleteDoc(doc(db, "waitlist", id));
  }
};
