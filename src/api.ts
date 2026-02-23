import { Profile, WaitlistEntry, Match, Stats, Review } from "./types";
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
  getCountFromServer,
  limit
} from "firebase/firestore";

export const api = {
  async getStats(): Promise<Stats> {
    try {
      const profilesColl = collection(db, "profiles");
      const matchesColl = collection(db, "matches");
      const connectionsQuery = query(collection(db, "matches"), where("status", "==", "connected"));

      const [profilesSnap, matchesSnap, connectionsSnap] = await Promise.all([
        getCountFromServer(profilesColl),
        getCountFromServer(matchesColl),
        getCountFromServer(connectionsQuery)
      ]);

      return {
        profiles: profilesSnap.data().count,
        matches: matchesSnap.data().count,
        connections: connectionsSnap.data().count
      };
    } catch (err) {
      console.error("Error fetching stats:", err);
      return { profiles: 0, matches: 0, connections: 0 };
    }
  },

  async getProfiles(): Promise<Profile[]> {
    try {
      const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Profile));
    } catch (err) {
      console.error("Error fetching profiles:", err);
      return [];
    }
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
    const q = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as WaitlistEntry));
  },

  async joinWaitlist(entry: WaitlistEntry): Promise<void> {
    await setDoc(doc(db, "waitlist", entry.id), entry);
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

  async adminLogin(password: string): Promise<boolean> {
    // Simple client-side check as requested before, or we could use a function.
    // Keeping it simple for now.
    return password === "shivapal";
  },

  async submitReview(review: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const id = Date.now().toString();
    const reviewData: Review = {
      ...review,
      id,
      status: 'pending',
      createdAt: Date.now()
    };
    await setDoc(doc(db, "reviews", id), reviewData);
  },

  async getApprovedReviews(): Promise<Review[]> {
    const q = query(
      collection(db, "reviews"), 
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
  },

  async getAllReviews(): Promise<Review[]> {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
  },

  async updateReviewStatus(id: string, status: 'approved' | 'pending'): Promise<void> {
    await updateDoc(doc(db, "reviews", id), { status });
  },

  async deleteReview(id: string): Promise<void> {
    await deleteDoc(doc(db, "reviews", id));
  }
};
