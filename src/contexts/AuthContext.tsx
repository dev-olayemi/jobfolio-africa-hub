import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, Folio, Subscription } from '@/lib/firebase-types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  folio: Folio | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [folio, setFolio] = useState<Folio | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      if (profileDoc.exists()) {
        setProfile({ id: profileDoc.id, ...profileDoc.data() } as UserProfile);
      }

      // Fetch folio
      const folioQuery = query(collection(db, 'folios'), where('userId', '==', userId));
      const folioSnapshot = await getDocs(folioQuery);
      if (!folioSnapshot.empty) {
        const folioData = folioSnapshot.docs[0];
        setFolio({ id: folioData.id, ...folioData.data() } as Folio);
      }

      // Fetch subscription
      const subscriptionQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId));
      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      if (!subscriptionSnapshot.empty) {
        const subscriptionData = subscriptionSnapshot.docs[0];
        setSubscription({ id: subscriptionData.id, ...subscriptionData.data() } as Subscription);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setProfile(null);
        setFolio(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    const profileData: Omit<UserProfile, 'id'> = {
      email,
      firstName,
      lastName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'profiles', user.uid), profileData);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value: AuthContextType = {
    user,
    profile,
    folio,
    subscription,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
