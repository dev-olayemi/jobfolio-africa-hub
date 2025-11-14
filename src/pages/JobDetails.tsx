import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  Heart,
  Eye,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job } from "@/lib/firebase-types";
import {
  recordJobView,
  toggleJobLike,
  hasUserLikedJob,
  submitJobApplication,
  hasUserApplied,
} from "@/lib/jobMetrics";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, subscription, folio } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const hasAccess =
    subscription &&
    (subscription.status === "trial" || subscription.status === "active");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        const jobDoc = await getDoc(doc(db, "jobs", id));
        if (jobDoc.exists()) {
          const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
          setJob(jobData);

          // Record view
          await recordJobView(id).catch((err) =>
            console.error("Failed to record view:", err)
          );

          // Check if user liked this job
          if (user?.uid) {
            const liked = await hasUserLikedJob(id, user.uid);
            setIsLiked(liked);

            // Check if user already applied
            const applied = await hasUserApplied(id, user.uid);
            setHasApplied(applied);
          }
        } else {
          toast.error("Job not found");
          navigate("/jobs");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate, user?.uid]);

  const handleApply = async () => {
    if (!hasAccess) {
      setShowAccessDialog(true);
      return;
    }

    if (hasApplied) {
      toast.info("You have already applied for this job");
      return;
    }

    if (!user?.uid || !id) {
      navigate("/auth");
      return;
    }

    setIsApplying(true);
    try {
      await submitJobApplication(id, user.uid);
      setHasApplied(true);
      toast.success("Application submitted successfully!");
      // Update the apply count in UI
      if (job) {
        setJob({ ...job, applies: (job.applies || 0) + 1 });
      }
    } catch (error) {
      console.error("Error applying:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleLike = async () => {
    if (!user?.uid || !id) {
      navigate("/auth");
      return;
    }

    setIsLiking(true);
    try {
      const newLikedState = await toggleJobLike(id, user.uid);
      setIsLiked(newLikedState);
      // Update the like count in UI
      if (job) {
        const newCount = newLikedState
          ? (job.likes || 0) + 1
          : Math.max((job.likes || 0) - 1, 0);
        setJob({ ...job, likes: newCount });
      }
      toast.success(newLikedState ? "Added to likes" : "Removed from likes");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/jobs")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {job.location}, {job.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Posted {job.postedAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {job.category}
                </Badge>
                {/* Job Metrics */}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{job.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{job.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{job.applies || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {hasAccess ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Job Description
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {job.contactEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className="hover:text-primary"
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                    {job.contactPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${job.contactPhone}`}
                          className="hover:text-primary"
                        >
                          {job.contactPhone}
                        </a>
                      </div>
                    )}
                    {job.applicationUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Application Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleApply}
                    size="lg"
                    className="flex-1"
                    disabled={isApplying || hasApplied}
                    variant={hasApplied ? "outline" : "default"}
                  >
                    {isApplying
                      ? "Applying..."
                      : hasApplied
                      ? "✓ Already Applied"
                      : "Apply Now"}
                  </Button>
                  <Button
                    onClick={handleLike}
                    size="lg"
                    variant={isLiked ? "default" : "outline"}
                    disabled={isLiking}
                    className="gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    {isLiking ? "..." : ""}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <p className="text-lg font-medium mb-2">Access Required</p>
                  <p className="text-muted-foreground">
                    To view full job details and contact information, you need
                    to build your folio or have an active subscription.
                  </p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={() => navigate("/build-folio")}>
                    Build Your Folio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Access Required</DialogTitle>
              <DialogDescription>
                To apply for jobs, you need to either build your folio or have
                an active subscription.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button onClick={() => navigate("/build-folio")}>
                Build Your Folio
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Grant Access (Pay Fee)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default JobDetails;
