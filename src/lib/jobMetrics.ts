import {
  collection,
  doc,
  setDoc,
  getDoc,
  increment,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Record a view for a job (auto-increment views count)
 * Views are tracked per job, not per user (anyone can contribute to view count)
 */
export async function recordJobView(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error("Error recording job view:", error);
  }
}

/**
 * Toggle a like for a job (user-specific)
 * Returns true if liked, false if unliked
 */
export async function toggleJobLike(
  jobId: string,
  userId: string
): Promise<boolean> {
  try {
    const likeRef = doc(db, `jobs/${jobId}/likes`, userId);
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(doc(db, "jobs", jobId), {
        likes: increment(-1),
      });
      return false;
    } else {
      // Like
      await setDoc(likeRef, {
        userId,
        createdAt: new Date(),
      });
      await updateDoc(doc(db, "jobs", jobId), {
        likes: increment(1),
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling job like:", error);
    throw error;
  }
}

/**
 * Check if a user has liked a job
 */
export async function hasUserLikedJob(
  jobId: string,
  userId: string
): Promise<boolean> {
  try {
    const likeRef = doc(db, `jobs/${jobId}/likes`, userId);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error("Error checking job like:", error);
    return false;
  }
}

/**
 * Record a job application (user-specific)
 * Creates an application record and increments apply count
 */
export async function submitJobApplication(
  jobId: string,
  userId: string
): Promise<void> {
  try {
    // Check if already applied
    const applicationRef = doc(db, `jobs/${jobId}/applications`, userId);
    const appDoc = await getDoc(applicationRef);

    if (appDoc.exists()) {
      throw new Error("You have already applied for this job");
    }

    // Create application record
    await setDoc(applicationRef, {
      userId,
      jobId,
      status: "pending",
      appliedAt: new Date(),
    });

    // Increment applies count
    await updateDoc(doc(db, "jobs", jobId), {
      applies: increment(1),
    });
  } catch (error) {
    console.error("Error submitting job application:", error);
    throw error;
  }
}

/**
 * Check if user has applied for a job
 */
export async function hasUserApplied(
  jobId: string,
  userId: string
): Promise<boolean> {
  try {
    const applicationRef = doc(db, `jobs/${jobId}/applications`, userId);
    const appDoc = await getDoc(applicationRef);
    return appDoc.exists();
  } catch (error) {
    console.error("Error checking job application:", error);
    return false;
  }
}

/**
 * Get application status for a job
 */
export async function getApplicationStatus(
  jobId: string,
  userId: string
): Promise<string | null> {
  try {
    const applicationRef = doc(db, `jobs/${jobId}/applications`, userId);
    const appDoc = await getDoc(applicationRef);

    if (appDoc.exists()) {
      return appDoc.data()?.status || "pending";
    }
    return null;
  } catch (error) {
    console.error("Error getting application status:", error);
    return null;
  }
}

/**
 * Get user's application for a job
 */
export async function getUserApplication(
  jobId: string,
  userId: string
): Promise<Record<string, unknown> | null> {
  try {
    const applicationRef = doc(db, `jobs/${jobId}/applications`, userId);
    const appDoc = await getDoc(applicationRef);

    if (appDoc.exists()) {
      return { id: appDoc.id, ...appDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user application:", error);
    return null;
  }
}

/**
 * Get all applications for a job (admin only - for future use)
 */
export async function getJobApplications(
  jobId: string
): Promise<Record<string, unknown>[]> {
  try {
    const applicationsRef = collection(db, `jobs/${jobId}/applications`);
    const snapshot = await getDocs(applicationsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting job applications:", error);
    return [];
  }
}

/**
 * Get all jobs liked by a user
 */
export async function getUserLikedJobs(userId: string): Promise<string[]> {
  try {
    // This requires querying across all job documents - for now, return empty
    // In production, you might want to store user's likes in a separate collection
    return [];
  } catch (error) {
    console.error("Error getting user liked jobs:", error);
    return [];
  }
}
