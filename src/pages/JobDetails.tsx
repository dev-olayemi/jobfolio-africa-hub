import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  CheckCircle,
  Briefcase,
  Clock,
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

          await recordJobView(id).catch((err) =>
            console.error("Failed to record view:", err)
          );

          if (user?.uid) {
            const liked = await hasUserLikedJob(id, user.uid);
            setIsLiked(liked);

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
      await toggleJobLike(id, user.uid);
      setIsLiked(!isLiked);
      if (job) {
        setJob({
          ...job,
          likes: (job.likes || 0) + (isLiked ? -1 : 1),
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const getDaysAgo = (timestamp: any) => {
    const postedDate = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getInitials = (company: string) => {
    return company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !job) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-32" />
              <Card className="border-border/50">
                <div className="h-32 bg-gradient-to-r from-primary to-accent" />
                <CardHeader className="space-y-4 -mt-12">
                  <div className="h-24 w-24 rounded-2xl bg-muted" />
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="mb-6 -ml-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>

          <Card className="mb-6 overflow-hidden border-border/50 shadow-xl">
            <div className="h-32 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="-mt-12 relative">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 rounded-2xl border-4 border-card shadow-xl bg-card">
                  <AvatarImage src={job.logoUrl} alt={job.company} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold rounded-2xl">
                    {getInitials(job.company)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 mt-8">
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Building2 className="h-5 w-5" />
                    <span className="text-lg font-medium">{job.company}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}, {job.country}
                    </div>
                    <div className="flex items-center gap-2 text-success font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Posted {getDaysAgo(job.postedAt)} days ago
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`rounded-full ${
                    isLiked ? "text-destructive border-destructive" : ""
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleApply}
                  disabled={isApplying || hasApplied}
                  size="lg"
                  className="flex-1 shadow-lg"
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-5 w-5 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-6 pt-6 border-t">
                <Badge variant="secondary" className="rounded-full px-4 py-2">
                  {job.category}
                </Badge>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {job.views || 0} views
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {job.likes || 0} likes
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {job.applies || 0} applicants
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <h2 className="text-xl font-bold">Job Description</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Responsibilities</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Requirements</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <h3 className="font-bold">Contact Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.contactEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {job.contactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <a
                          href={`tel:${job.contactPhone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {job.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access Required</DialogTitle>
            <DialogDescription>
              To apply for jobs, you need to either build your folio or pay the access fee.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {!folio && (
              <Button
                onClick={() => {
                  setShowAccessDialog(false);
                  navigate("/build-folio");
                }}
                size="lg"
              >
                Build Your Folio
              </Button>
            )}
            <Button
              onClick={() => {
                setShowAccessDialog(false);
                navigate("/payment");
              }}
              variant="outline"
              size="lg"
            >
              Pay Access Fee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails;
