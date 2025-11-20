import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  collection,
  query,
  where,
  getDocs,
  collectionGroup,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const JobApplicationsLanding = () => {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // jobs posted by user
        const jobsQ = query(
          collection(db, "jobs"),
          where("postedById", "==", user.uid)
        );
        const jobsSnap = await getDocs(jobsQ);
        const jobs = jobsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setMyJobs(jobs);

        // applications submitted by user (collection group)
        const appsQ = query(
          collectionGroup(db, "applications"),
          where("applicantId", "==", user.uid)
        );
        const appsSnap = await getDocs(appsQ);
        setMyApplications(
          appsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Failed to load applications");
      }
    };

    load();
  }, [user]);

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Applications</h1>
        {errorMsg && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-medium mb-3">Jobs you've posted</h2>
            <div className="space-y-3">
              {myJobs.length === 0 ? (
                <Card>
                  <CardContent className="text-muted-foreground py-6 text-center">
                    You don't have any job postings yet.
                  </CardContent>
                </Card>
              ) : (
                myJobs.map((j) => (
                  <Card key={j.id} className="hover:shadow transition-shadow">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{j.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {j.location || "Remote"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/job/${j.id}/applications`}>
                          <Button variant="outline">View applications</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">
              Applications you submitted
            </h2>
            <div className="space-y-3">
              {myApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-muted-foreground py-6 text-center">
                    You haven't applied to any jobs yet.
                  </CardContent>
                </Card>
              ) : (
                myApplications.map((a) => (
                  <Card key={a.id} className="hover:shadow transition-shadow">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {a.jobTitle || "Application"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {a.companyName || a.jobId || ""}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {a.status || "pending"}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobApplicationsLanding;
