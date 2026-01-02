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
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  ArrowLeft,
  Trash2,
  MapPin,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { formatSalary } from "@/lib/utils";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) return;

      try {
        const jobs = await getDocs(collection(db, "jobs"));
        const userSavedJobs: any[] = [];

        for (const jobDoc of jobs.docs) {
          const likeRef = doc(db, "jobs", jobDoc.id, "likes", user.uid);
          const likeSnap = await getDoc(likeRef);

          if (likeSnap.exists()) {
            userSavedJobs.push({
              jobId: jobDoc.id,
              ...jobDoc.data(),
              savedAt: likeSnap.data().likedAt,
            });
          }
        }

        setSavedJobs(
          userSavedJobs.sort(
            (a, b) => b.savedAt?.toDate?.() - a.savedAt?.toDate?.()
          )
        );
      } catch (error: any) {
        console.error("Error fetching saved jobs:", error);
        toast.error("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user]);

  const handleRemoveSave = async (jobId: string) => {
    if (!user) return;

    setRemoving(jobId);
    try {
      await deleteDoc(doc(db, "jobs", jobId, "likes", user.uid));
      setSavedJobs(savedJobs.filter((job) => job.jobId !== jobId));
      toast.success("Job removed from saved");
    } catch (error: any) {
      console.error("Error removing saved job:", error);
      toast.error("Failed to remove job");
    } finally {
      setRemoving(null);
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
          <h1 className="text-3xl font-bold">Saved Jobs</h1>
          <p className="text-muted-foreground">
            {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : savedJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't saved any jobs yet
              </p>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <Card
                key={job.jobId}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div
                    onClick={() => navigate(`/jobs/${job.jobId}`)}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <Badge variant="outline">{job.jobType}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{job.company}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      {job.experienceLevel && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.experienceLevel}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salary)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-between items-center pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.jobId}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSave(job.jobId)}
                      disabled={removing === job.jobId}
                    >
                      {removing === job.jobId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
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

export default SavedJobs;
