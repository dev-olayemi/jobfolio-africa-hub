import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { UserProfile, Folio, Subscription } from "@/lib/firebase-types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  folio: Folio | null;
  subscription: Subscription | null;
  loading: boolean;
  fetchError: string | null;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    country?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [folio, setFolio] = useState<Folio | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      setFetchError(null);
      // Fetch profile
      const profileRef = doc(db, "profiles", userId);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        setProfile({ id: profileDoc.id, ...profileDoc.data() } as UserProfile);
      } else {
        // If no profile exists yet, create a basic profile from the auth user's info.
        // This helps users who signed up but whose profile write was blocked earlier.
        try {
          const current = auth.currentUser;
          const displayName = current?.displayName || "";
          const [firstName = "", lastName = ""] = displayName
            ? displayName.split(" ")
            : ["", ""];

          const profileData: Omit<UserProfile, "id"> = {
            email: current?.email || "",
            firstName: firstName || "",
            lastName: lastName || "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await setDoc(profileRef, profileData);
          setProfile({ id: profileRef.id, ...profileData } as UserProfile);
        } catch (createErr) {
          // If creating the profile fails (for example due to rules), log and continue.
          console.error("Error creating default profile:", createErr);
        }
      }

      // Fetch folio
      const folioQuery = query(
        collection(db, "folios"),
        where("userId", "==", userId)
      );
      const folioSnapshot = await getDocs(folioQuery);
      if (!folioSnapshot.empty) {
        const folioData = folioSnapshot.docs[0];
        setFolio({ id: folioData.id, ...folioData.data() } as Folio);
      }

      // Fetch subscription
      const subscriptionQuery = query(
        collection(db, "subscriptions"),
        where("userId", "==", userId)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      if (!subscriptionSnapshot.empty) {
        const subscriptionData = subscriptionSnapshot.docs[0];
        setSubscription({
          id: subscriptionData.id,
          ...subscriptionData.data(),
        } as Subscription);
      }
    } catch (err: unknown) {
      // Surface clearer message when Firestore rules block access
      const error = err as { code?: string; message?: string };
      console.error("Error fetching user data:", error);
      setFetchError(error?.message || "Failed to fetch user data");
      if (
        error?.code === "permission-denied" ||
        (typeof error?.message === "string" &&
          error.message.includes("Missing or insufficient permissions"))
      ) {
        toast.error(
          "Firestore permission error: check your Firestore rules or ensure the app is using the correct Firebase project/config."
        );
      } else {
        toast.error(error?.message || "Failed to fetch user data");
      }
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  useEffect(() => {
    // Configure persistence so users remain signed in across browser restarts
    // Default persistence is `local` which preserves the session until sign-out.
    // We also support an optional expiry window via `VITE_AUTH_EXPIRE_HOURS`.
    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Failed to set auth persistence:", err);
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);

        // If the user is signed in, check stored timestamp to optionally expire session
        if (user) {
          try {
            const expiryHours =
              Number(import.meta.env.VITE_AUTH_EXPIRE_HOURS) || 168; // default 7 days
            const expiryMs = expiryHours * 60 * 60 * 1000;
            const lastSignInTs = Number(
              localStorage.getItem("jobfolio_last_signin") || "0"
            );

            if (lastSignInTs && Date.now() - lastSignInTs > expiryMs) {
              // Session expired according to configured window
              await signOut(auth);
              localStorage.removeItem("jobfolio_last_signin");
              setProfile(null);
              setFolio(null);
              setSubscription(null);
              setLoading(false);
              // Don't fetch user data after expiring
              return;
            }

            await fetchUserData(user.uid);
          } catch (err) {
            console.error("Error during auth state handling:", err);
          }
        } else {
          setProfile(null);
          setFolio(null);
          setSubscription(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    })();
  }, []);

  // Listen for external retry requests (Profile page Retry button sends this)
  useEffect(() => {
    const handler = () => {
      if (auth.currentUser) {
        fetchUserData(auth.currentUser.uid);
      }
    };

    window.addEventListener("refreshUserData", handler as EventListener);
    return () =>
      window.removeEventListener("refreshUserData", handler as EventListener);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    country?: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    const profileData: Omit<UserProfile, "id"> = {
      email,
      firstName,
      lastName,
      country: country || undefined,
      badges: [],
      isAdmin: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "profiles", user.uid), profileData);
    // Remember sign-in time for session expiry checks
    try {
      localStorage.setItem("jobfolio_last_signin", String(Date.now()));
    } catch (err) {
      /* ignore storage errors */
    }
  };

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      localStorage.setItem("jobfolio_last_signin", String(Date.now()));
    } catch (err) {
      /* ignore storage errors */
    }
    return cred;
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
    fetchError,
    signUp,
    signIn,
    logout,
    resetPassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
