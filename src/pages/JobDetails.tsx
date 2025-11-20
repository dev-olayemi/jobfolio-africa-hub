/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Zap,
  AlertCircle,
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
  const [showReviewModal, setShowReviewModal] = useState(false);
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
          // store recently viewed jobs in localStorage for quick interactions list
          try {
            const key = "recentlyViewedJobs";
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            // remove any existing entry for this job
            const filtered = arr.filter((x: any) => x.id !== jobDoc.id);
            filtered.unshift({
              id: jobDoc.id,
              title: jobData.title || "",
              company: jobData.company || "",
              viewedAt: new Date().toISOString(),
            });
            // keep only latest 20
            localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)));
          } catch (e) {
            // ignore storage errors
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

    // Show review modal instead of directly applying
    setShowReviewModal(true);
  };

  const handleConfirmApply = async () => {
    if (!user?.uid || !id) {
      navigate("/auth");
      return;
    }

    setIsApplying(true);
    try {
      await submitJobApplication(id, user.uid);
      setHasApplied(true);
      setShowReviewModal(false);
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
      toast.error("Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  const getDaysAgo = (timestamp: any) => {
    // Support Firestore Timestamp, JS Date, numeric epoch, or ISO string.
    if (!timestamp) return 0;
    let postedDate: Date | null = null;
    try {
      if (
        typeof timestamp === "object" &&
        typeof timestamp.toDate === "function"
      ) {
        postedDate = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        postedDate = timestamp;
      } else if (typeof timestamp === "number") {
        postedDate = new Date(timestamp);
      } else if (typeof timestamp === "string") {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) postedDate = d;
      }
    } catch (err) {
      postedDate = null;
    }
    if (!postedDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getInitials = (company: string) => {
    return company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatSalary = (salary: any) => {
    // salary may be a string (legacy) or an object { min, max, currency }
    if (!salary) return "";
    if (typeof salary === "string") return salary;
    if (typeof salary === "object") {
      const { min, max, currency } = salary;
      const c = currency ? `${currency} ` : "";
      if (min != null && max != null) {
        try {
          const minNum = typeof min === "number" ? min : parseInt(min as any);
          const maxNum = typeof max === "number" ? max : parseInt(max as any);
          if (!isNaN(minNum) && !isNaN(maxNum)) {
            return `${c}${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
          }
        } catch (e) {
          // fallback
        }
      }
      if (min != null) return `${c}${min}`;
      if (max != null) return `${c}${max}`;
      return "";
    }
    return String(salary);
  };

  const coerceToStringArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean).map((v) => String(v));
    if (typeof val === "string")
      return val
        .split("\n")
        .map((r) => (typeof r === "string" ? r.trim() : String(r)))
        .filter(Boolean);
    return [];
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

          <Card className="mb-6 overflow-hidden border-0 shadow-lg">
            {/* Banner: prefer a job banner if available, otherwise fall back to gradient */}
            {/* Prefer explicit bannerUrl, then media[0], then coverImage/logoUrl */}
            {(job as any).bannerUrl ||
            (job as any).media?.[0] ||
            (job as any).coverImage ||
            job.logoUrl ? (
              <img
                src={
                  (job as any).bannerUrl ||
                  (job as any).media?.[0] ||
                  (job as any).coverImage ||
                  job.logoUrl
                }
                alt={`${job.company} banner`}
                className="w-full h-24 sm:h-32 object-cover"
              />
            ) : (
              <div className="h-24 sm:h-32 bg-gradient-to-r from-primary via-accent to-primary" />
            )}
            <CardHeader className="-mt-12 sm:-mt-12 relative z-10">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Avatar className="h-28 w-28 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-2xl border-4 border-card shadow-xl bg-card flex-shrink-0">
                  <AvatarImage src={job.logoUrl} alt={job.company} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold rounded-2xl">
                    {getInitials(job.company)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                        {job.title}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {job.company}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`rounded-full flex-shrink-0 ${
                        isLiked
                          ? "text-destructive border-destructive bg-destructive/10"
                          : ""
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-success font-semibold">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {getDaysAgo(job.postedAt)}d ago
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <Button
                      onClick={handleApply}
                      disabled={isApplying || hasApplied}
                      size="lg"
                      className="w-full shadow-md bg-gradient-to-r from-primary to-accent hover:opacity-90"
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
                    <Button
                      onClick={() => navigate("/payment")}
                      variant="outline"
                      size="lg"
                      className="w-full shadow-sm"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Refine CV for this Job (₦1,000)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 gap-y-2 mt-4 pt-4 border-t">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {job.category}
                </Badge>
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{job.views || 0} viewed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    <span>{job.likes || 0} liked</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Job Description
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {coerceToStringArray(job.responsibilities).length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Responsibilities
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {coerceToStringArray(job.responsibilities).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-sm sm:text-base"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {coerceToStringArray(job.requirements).length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      Requirements
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {coerceToStringArray(job.requirements).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-sm sm:text-base"
                          >
                            <div className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {job.contactEmail || job.contactPhone ? (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <h3 className="font-bold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Contact
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.contactEmail && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                          Email
                        </p>
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                    {job.contactPhone && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                          Phone
                        </p>
                        <a
                          href={`tel:${job.contactPhone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {job.contactPhone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-0 shadow-md bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Application Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Make sure your profile is complete</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Highlight relevant skills</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Apply early for better chances</span>
                    </li>
                  </ul>
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
              To apply for jobs, you need to either build your folio or pay the
              access fee.
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

      {/* Application Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
              Review Your Application
            </DialogTitle>
            <DialogDescription className="text-sm">
              Before submitting, make sure everything is correct
            </DialogDescription>
          </DialogHeader>

          {job && (
            <div className="space-y-6">
              {/* Job Preview */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/10">
                <div className="flex gap-3 sm:gap-4 items-start">
                  {job.companyLogo && (
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                      <AvatarImage src={job.companyLogo} alt={job.company} />
                      <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        {formatSalary(job.salary)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Profile Preview */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Your Profile
                </h4>
                {folio?.personalInfo && (
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">
                        {folio.personalInfo.fullName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{folio.personalInfo.email}</p>
                    </div>
                    {folio.personalInfo.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">
                          {folio.personalInfo.phone}
                        </p>
                      </div>
                    )}
                    {folio.personalInfo.location && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">
                          {folio.personalInfo.location}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Skills Preview */}
              {folio?.skills && folio.skills.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Your Skills ({folio.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {folio.skills.slice(0, 5).map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {folio.skills.length > 5 && (
                      <Badge variant="outline">
                        +{folio.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <p className="text-amber-800">
                  By submitting this application, you confirm that the
                  information above is accurate.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  disabled={isApplying}
                  className="flex-1 text-sm sm:text-base"
                >
                  Review Profile
                </Button>
                <Button
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                  size="lg"
                  className="flex-1 text-sm sm:text-base"
                >
                  {isApplying ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm & Apply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails;
