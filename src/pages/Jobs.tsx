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
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>(
    localStorage.getItem("selectedCountry") || ""
  );

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
        let jobsQuery = query(
          collection(db, "jobs"),
          where("isActive", "==", true),
          orderBy("postedAt", "desc"),
          limit(50)
        );

        // Filter by country if selected
        if (selectedCountry) {
          jobsQuery = query(
            collection(db, "jobs"),
            where("isActive", "==", true),
            where("country", "==", selectedCountry),
            orderBy("postedAt", "desc"),
            limit(50)
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
              orderBy("postedAt", "desc"),
              limit(50)
            );
          }
        }

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData: Job[] = [];
        querySnapshot.forEach((doc) => {
          jobsData.push({ id: doc.id, ...doc.data() } as Job);
        });
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
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
  }, [folio, selectedCountry]);

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

  const getDaysAgo = (timestamp: any) => {
    const postedDate = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInitials = (company: string) => {
    return company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Discover Jobs
                </h1>
                <p className="text-muted-foreground mt-1">
                  {filteredJobs.length} opportunities waiting for you
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-3 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border/50 shadow-sm"
                />
              </div>
              <Button variant="outline" size="lg" className="gap-2 shadow-sm">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse border-border/50 shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="text-center py-16 border-border/50 shadow-md">
              <CardContent>
                <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or check back later for new
                  opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 hover:-translate-y-1 bg-card overflow-hidden"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="pb-3 relative">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-xl border-2 border-border shadow-sm">
                        <AvatarImage src={job.logoUrl} alt={job.company} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-semibold rounded-xl">
                          {getInitials(job.company)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 relative">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-success font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full px-3">
                        {job.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {getDaysAgo(job.postedAt)}d ago
                      </div>
                    </div>

                    {/* Metrics - Only show date posted */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Posted {getDaysAgo(job.postedAt)}d ago</span>
                    </div>

                    <Button
                      onClick={(e) => handleApplyClick(e, job.id)}
                      className="w-full mt-2 shadow-sm hover:shadow-md transition-shadow"
                      size="lg"
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
