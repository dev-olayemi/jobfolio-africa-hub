import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  collectionGroup,
} from "firebase/firestore";
import { Briefcase, FileText, Users } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(
    null
  );
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // posts by user
        const postsQ = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid)
        );
        const postsSnap = await getDocs(postsQ);
        setPostsCount(postsSnap.size);

        // jobs by user
        const jobsQ = query(
          collection(db, "jobs"),
          where("postedById", "==", user.uid)
        );
        const jobsSnap = await getDocs(jobsQ);
        setJobsCount(jobsSnap.size);

        // applications submitted by user (collection group)
        const appsQ = query(
          collectionGroup(db, "applications"),
          where("applicantId", "==", user.uid)
        );
        const appsSnap = await getDocs(appsQ);
        setApplicationsCount(appsSnap.size);

        // recent posts (global)
        const recentQ = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const recentSnap = await getDocs(recentQ);
        setRecentPosts(recentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Failed to load dashboard data");
      }
    };

    load();
  }, [user]);

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{postsCount ?? "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Your published updates
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobsCount ?? "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Jobs you posted
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applicationsCount ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Applications you submitted
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {recentPosts.length === 0 ? (
                <div className="text-muted-foreground">No recent posts</div>
              ) : (
                recentPosts.map((p) => (
                  <Card key={p.id} className="hover:shadow">
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="font-semibold">
                            {p.title || "Untitled"}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {p.excerpt || p.body?.slice?.(0, 120) || "—"}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.createdAt?.toDate
                            ? new Date(
                                p.createdAt.toDate()
                              ).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>

            <div className="space-y-2">
              <Button className="w-full">Create Post</Button>
              <Button variant="outline" className="w-full">
                Post a Job
              </Button>
              <Button variant="ghost" className="w-full">
                Manage Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
