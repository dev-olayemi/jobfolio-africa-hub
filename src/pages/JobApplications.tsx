/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

const JobApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !user) return;

      try {
        // Fetch job
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          toast.error("Job not found");
          navigate("/manage-jobs");
          return;
        }

        const jobData = jobSnap.data();

        // Check if user is the job poster
        if (jobData.postedById !== user.uid) {
          toast.error("You don't have permission to view this");
          navigate("/manage-jobs");
          return;
        }

        setJob({ id: jobId, ...jobData });

        // Fetch applications
        const appsRef = collection(db, `jobs/${jobId}/applications`);
        const appSnap = await getDocs(appsRef);
        const appsData = appSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setApplications(
          appsData.sort((a, b) => {
            const toMillis = (val: any) => {
              if (!val) return 0;
              if (typeof val.toDate === "function")
                return val.toDate().getTime();
              if (val instanceof Date) return val.getTime();
              if (typeof val === "number") return val;
              return 0;
            };
            return toMillis(b?.appliedAt) - toMillis(a?.appliedAt);
          })
        );
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, user, navigate]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    if (!jobId) return;

    setUpdating(appId);
    try {
      const appRef = doc(db, `jobs/${jobId}/applications`, appId);
      await updateDoc(appRef, { status: newStatus });

      setApplications(
        applications.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Application marked as ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    } finally {
      setUpdating(null);
    }
  };

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

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-3 py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-3 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/manage-jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {job && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Applications for {job.title}</h1>
            <p className="text-muted-foreground">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground">
                No applications received yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          {app.applicantName || "Unknown Applicant"}
                        </h3>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground mb-3">
                        {app.applicantEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${app.applicantEmail}`}
                              className="hover:text-primary underline"
                            >
                              {app.applicantEmail}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {app.appliedAt
                            ? new Date(
                                app.appliedAt.toDate()
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 items-start md:items-end">
                      <Badge variant={getStatusColor(app.status)}>
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </Badge>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(app.id, "shortlisted")
                          }
                          disabled={updating === app.id}
                          className="gap-1"
                        >
                          {updating === app.id && app.id === updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Shortlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(app.id, "rejected")}
                          disabled={updating === app.id}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          {updating === app.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
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

export default JobApplications;
