import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  collection,
  where as whereEq,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Interactions = () => {
  const { user } = useAuth();
  const [likedJobs, setLikedJobs] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // liked jobs: query collectionGroup 'likes' where userId == uid
        const likesQ = query(
          collectionGroup(db, "likes"),
          where("userId", "==", user.uid)
        );
        const likesSnap = await getDocs(likesQ);
        const jobIds: string[] = [];
        likesSnap.forEach((d) => {
          const parentJobId = d.ref.parent.parent?.id;
          if (parentJobId) jobIds.push(parentJobId);
        });

        const likedJobsData: any[] = [];
        for (const id of jobIds) {
          const jobDoc = await getDoc(doc(db, "jobs", id));
          if (jobDoc.exists())
            likedJobsData.push({ id: jobDoc.id, ...jobDoc.data() });
        }
        setLikedJobs(likedJobsData);

        // liked posts: posts where likes array-contains user.uid
        const postsQ = query(
          collection(db, "posts"),
          where("likes", "array-contains", user.uid)
        );
        const postsSnap = await getDocs(postsQ);
        setLikedPosts(postsSnap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          return { id: d.id, ...data };
        }));

        // applications submitted by user (collectionGroup)
        const appsQ = query(
          collectionGroup(db, "applications"),
          where("applicantId", "==", user.uid)
        );
        const appsSnap = await getDocs(appsQ);
        setApplications(appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // recently viewed from localStorage (client-side)
        try {
          const raw = localStorage.getItem("recentlyViewedJobs");
          const arr = raw ? JSON.parse(raw) : [];
          setRecentlyViewed(arr.slice(0, 20));
        } catch (e) {
          setRecentlyViewed([]);
        }
      } catch (err: any) {
        console.error("Error loading interactions:", err);
        setErrorMsg(
          err?.message || "Failed to load interactions (permissions?)"
        );
      }
    };

    load();
  }, [user]);

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Interactions</h1>
        {errorMsg && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
            {errorMsg}
          </div>
        )}

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Recently Viewed</h2>
          {recentlyViewed.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-muted-foreground text-center">
                No recently viewed projects
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentlyViewed.map((r: any) => (
                <Card key={r.id} className="hover:shadow transition-shadow">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.company}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.viewedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Saved / Liked Jobs</h2>
          {likedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-muted-foreground text-center">
                You haven't saved or liked any jobs yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {likedJobs.map((j) => (
                <Card key={j.id} className="hover:shadow transition-shadow">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{j.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {j.company}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/jobs/${j.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Liked Posts</h2>
          {likedPosts.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-muted-foreground text-center">
                No liked posts yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {likedPosts.map((p) => (
                <Card key={p.id} className="hover:shadow transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {p.authorName || "Post"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {p.content?.slice?.(0, 140) || ""}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.createdAt?.toDate
                          ? new Date(p.createdAt.toDate()).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Applications</h2>
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-muted-foreground text-center">
                You haven't submitted any applications yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {applications.map((a) => (
                <Card key={a.id} className="hover:shadow transition-shadow">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {a.jobTitle || a.jobId || "Application"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {a.companyName || ""}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {a.status || "pending"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Interactions;
