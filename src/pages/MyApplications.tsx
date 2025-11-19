/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ArrowLeft, Calendar, MapPin, Briefcase } from "lucide-react";

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const jobs = await getDocs(collection(db, "jobs"));
        const userApplications: any[] = [];

        for (const jobDoc of jobs.docs) {
          const appRef = doc(db, "jobs", jobDoc.id, "applications", user.uid);
          const appSnap = await getDoc(appRef);

          if (appSnap.exists()) {
            userApplications.push({
              jobId: jobDoc.id,
              ...jobDoc.data(),
              application: {
                id: appSnap.id,
                ...appSnap.data(),
              },
            });
          }
        }

        setApplications(
          userApplications.sort(
            (a, b) =>
              b.application.appliedAt?.toDate?.() -
              a.application.appliedAt?.toDate?.()
          )
        );
      } catch (error: any) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load your applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewed":
        return "secondary";
      case "shortlisted":
        return "default";
      case "rejected":
        return "destructive";
      case "accepted":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-3 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't applied to any jobs yet
              </p>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app.jobId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{app.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {app.company}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {app.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {app.jobType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {app.application.appliedAt
                            ? new Date(
                                app.application.appliedAt.toDate()
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>

                      {app.application.coverLetter && (
                        <div className="text-sm mb-3">
                          <p className="text-muted-foreground mb-1">
                            Cover Letter:
                          </p>
                          <p className="line-clamp-2">
                            {app.application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 items-start md:items-end">
                      <Badge variant={getStatusColor(app.application.status)}>
                        {app.application.status.charAt(0).toUpperCase() +
                          app.application.status.slice(1)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${app.jobId}`)}
                      >
                        View Job
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplications;
