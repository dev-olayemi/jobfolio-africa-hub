/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Eye,
  Share2,
  Heart,
  Users,
  Search,
  Filter,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job } from "@/lib/firebase-types";
import { recordJobView } from "@/lib/jobMetrics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Jobs = () => {
  const navigate = useNavigate();
  const { user, subscription, folio } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedCount, setFetchedCount] = useState<number | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedCountry, setSelectedCountry] = useState<string>(
    localStorage.getItem("selectedCountry") || ""
  );
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  const hasAccess =
    subscription &&
    (subscription.status === "trial" || subscription.status === "active");

  useEffect(() => {
    const onCountryChange = (e: any) => {
      setSelectedCountry(
        e?.detail || localStorage.getItem("selectedCountry") || ""
      );
    };
    window.addEventListener("countryChanged", onCountryChange as EventListener);
    // initialize
    onCountryChange(null);

    const fetchJobs = async () => {
      try {
        // Query active jobs; don't order server-side to avoid index/field-missing issues.
        // We'll sort client-side by postedAt/createdAt for robustness.
        // Use a permissive type so we can reassign to a Query result below.
        let jobsQuery: any = collection(db, "jobs");

        const whereClauses: any[] = [];
        if (showActiveOnly) whereClauses.push(where("isActive", "==", true));

        // Build query with optional country and industries filters
        if (selectedCountry) {
          whereClauses.push(where("country", "==", selectedCountry));
        }

        if (folio && folio.industries.length > 0 && !selectedCountry) {
          whereClauses.push(where("category", "in", folio.industries));
        }

        // Compose final query
        jobsQuery = query(collection(db, "jobs"), ...whereClauses, limit(200));

        // Filter by country if selected
        if (selectedCountry) {
          jobsQuery = query(
            collection(db, "jobs"),
            where("isActive", "==", true),
            where("country", "==", selectedCountry),
            limit(200)
          );
        }

        // Filter by user's selected industries if they have a folio
        if (folio && folio.industries.length > 0) {
          // note: Firestore 'in' queries can't be combined with equality on a different field
          // For now, prioritize country filtering; if no country filter, apply industries.
          if (!selectedCountry) {
            jobsQuery = query(
              collection(db, "jobs"),
              where("isActive", "==", true),
              where("category", "in", folio.industries),
              limit(200)
            );
          }
        }

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData: Job[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Record<string, any>;
          jobsData.push({ id: doc.id, ...data } as Job);
        });
        setJobs(jobsData);
        setFetchedCount(querySnapshot.size);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setFetchError((error as any)?.message || String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () =>
      window.removeEventListener(
        "countryChanged",
        onCountryChange as EventListener
      );
  }, [folio, selectedCountry, showActiveOnly]);

  const handleJobClick = (jobId: string) => {
    recordJobView(jobId).catch((err) =>
      console.error("Failed to record view:", err)
    );
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!hasAccess) {
      setShowAccessDialog(true);
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  const handleShare = async (job: Job) => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    const title = job.title || "Job";
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title, text: job.company || "", url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        // lightweight feedback for now
        alert("Job link copied to clipboard");
      } else {
        // fallback prompt
        window.prompt("Copy this link", url);
      }
    } catch (err) {
      console.error("Share failed", err);
      alert("Unable to share job link");
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

  const jobAgeLabel = (timestamp: any) => {
    const days = getDaysAgo(timestamp);
    if (days === 0) return "Today";
    if (days <= 7) return "Recently posted";
    if (days < 30) return `${days}d ago`;
    const weeks = Math.ceil(days / 7);
    return `${weeks}w ago`;
  };

  const formatSalary = (salary: any) => {
    if (!salary) return "";
    if (typeof salary === "string") return salary;
    if (typeof salary === "object") {
      const { min, max, currency } = salary as any;
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

  const getInitials = (company: string) => {
    return company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredJobs = jobs
    .filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice()
    .sort((a, b) => {
      const getTs = (job: any) => {
        // prefer postedAt, then createdAt, then updatedAt
        const t = job.postedAt || job.createdAt || job.updatedAt;
        if (!t) return 0;
        return t?.toMillis
          ? t.toMillis()
          : t?.seconds
          ? t.seconds * 1000
          : typeof t === "number"
          ? t
          : 0;
      };

      if (sortBy === "newest") {
        return getTs(b) - getTs(a);
      }
      if (sortBy === "oldest") {
        return getTs(a) - getTs(b);
      }
      if (sortBy === "salaryHigh") {
        const parseSalary = (s: any) => {
          if (!s) return 0;
          const m = String(s).replace(/[,\s]/g, "").match(/(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        };
        return parseSalary(b.salary) - parseSalary(a.salary);
      }
      return 0;
    });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent line-clamp-1">
                  Discover Jobs
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {filteredJobs.length} opportunities waiting for you
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-12 bg-card border-border/50 shadow-sm text-xs sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 sm:h-12 bg-card border border-border/50 px-3 text-sm rounded-md"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="salaryHigh">Salary: High to Low</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shadow-sm sm:px-4 whitespace-nowrap"
                  asChild
                >
                  <div className="flex items-center justify-center">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </div>
                </Button>

                <Button
                  variant={showActiveOnly ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setShowActiveOnly((s) => !s)}
                  className="gap-2 shadow-sm sm:px-3 whitespace-nowrap"
                >
                  <div className="flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {showActiveOnly ? "Active only" : "Show all"}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse border border-border/50 shadow-md overflow-hidden"
                >
                  <CardHeader className="pb-4 sm:pb-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 bg-muted rounded-full w-20" />
                      <div className="h-4 bg-muted rounded w-16 ml-auto" />
                    </div>
                    <div className="pt-2">
                      <div className="h-10 bg-muted rounded w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="text-center py-12 sm:py-16 border border-border/50 shadow-md">
              <CardContent>
                {fetchError && (
                  <div className="text-sm text-destructive mb-4">
                    Error loading jobs: {fetchError}
                  </div>
                )}
                {fetchedCount !== null && fetchedCount === 0 && (
                  <div className="text-sm text-muted-foreground mb-4">
                    No active jobs found in the database (fetched: 0)
                  </div>
                )}
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  No jobs found
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search or check back later for new
                  opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border border-border/50 hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col"
                  onClick={() => handleJobClick(job.id)}
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Header with Company Logo */}
                  <CardHeader className="pb-4 sm:pb-5 relative">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl border-2 border-border/50 shadow-md flex-shrink-0">
                        <AvatarImage src={job.logoUrl} alt={job.company} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold rounded-xl text-xs sm:text-sm">
                          {getInitials(job.company)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1.5 line-clamp-1">
                          <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(job);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Job Details */}
                  <CardContent className="space-y-4 sm:space-y-5 relative flex-1 flex flex-col">
                    {/* Location and Salary Row */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                    </div>

                    {/* Category Badge and Posted Date */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
                        >
                          {job.category}
                        </Badge>

                        {/* Age badge: show 'Recently posted' when <= 7 days */}
                        {getDaysAgo(job.postedAt || job.createdAt) <= 7 ? (
                          <Badge
                            className="text-xs px-2 py-1 rounded-full"
                            title={
                              (job.postedAt || job.createdAt)?.toDate
                                ? (job.postedAt || job.createdAt)
                                    .toDate()
                                    .toLocaleString()
                                : ""
                            }
                          >
                            {jobAgeLabel(job.postedAt || job.createdAt)}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span
                              className="whitespace-nowrap"
                              title={
                                (job.postedAt || job.createdAt)?.toDate
                                  ? (job.postedAt || job.createdAt)
                                      .toDate()
                                      .toLocaleString()
                                  : ""
                              }
                            >
                              {jobAgeLabel(job.postedAt || job.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={(e) => handleApplyClick(e, job.id)}
                      className="w-full mt-auto sm:mt-4 shadow-md hover:shadow-lg transition-shadow duration-200 text-xs sm:text-sm py-2 sm:py-3"
                      size="sm"
                    >
                      {hasAccess ? "Apply Now" : "View Details"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Access Required Dialog */}
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
    </Layout>
  );
};

export default Jobs;
