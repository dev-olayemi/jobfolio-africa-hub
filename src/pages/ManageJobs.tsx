/* eslint-disable react-hooks/rules-of-hooks */
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
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const accountType = (profile as any)?.accountType;

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Redirect job seekers
  if (accountType === "jobseeker") {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-3 py-12">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Not Available</CardTitle>
              <CardDescription>
                Only recruiters, companies, and employers can manage posted
                jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "jobs"),
          where("postedById", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const jobsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ?? null,
          };
        });
        setJobs(
          jobsData.sort((a, b) => {
            const aDate =
              a.createdAt?.toDate?.() instanceof Date
                ? a.createdAt.toDate().getTime()
                : 0;
            const bDate =
              b.createdAt?.toDate?.() instanceof Date
                ? b.createdAt.toDate().getTime()
                : 0;
            return bDate - aDate;
          })
        );
      } catch (error: any) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load your jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    setDeleting(jobId);
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      await updateDoc(doc(db, "jobs", jobId), { status: newStatus });
      setJobs(
        jobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
      toast.success(`Job ${newStatus === "active" ? "reopened" : "closed"}`);
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job status");
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-3 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Jobs</h1>
              <p className="text-muted-foreground">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/post-job")}>Post New Job</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">No jobs posted yet</p>
              <Button onClick={() => navigate("/post-job")}>
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge
                          variant={
                            job.status === "active" ? "default" : "secondary"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {job.company} • {job.location}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{job.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{job.applications || 0} applications</span>
                        </div>
                        {job.salary?.min && (
                          <div className="text-muted-foreground">
                            {job.salary.currency}{" "}
                            {job.salary.min.toLocaleString()}-
                            {job.salary.max?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(job.id, job.status)}
                      >
                        {job.status === "active" ? "Close" : "Reopen"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/job/${job.id}/applications`)}
                        className="gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {job.applications || 0}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleting === job.id}
                      >
                        {deleting === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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

export default ManageJobs;
