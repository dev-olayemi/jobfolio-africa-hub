import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job } from "@/lib/firebase-types";
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

  const hasAccess = subscription && (subscription.status === 'trial' || subscription.status === 'active');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let jobsQuery = query(
          collection(db, 'jobs'),
          where('isActive', '==', true),
          orderBy('postedAt', 'desc'),
          limit(50)
        );

        // Filter by user's selected industries if they have a folio
        if (folio && folio.industries.length > 0) {
          jobsQuery = query(
            collection(db, 'jobs'),
            where('isActive', '==', true),
            where('category', 'in', folio.industries),
            orderBy('postedAt', 'desc'),
            limit(50)
          );
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
  }, [folio]);

  const handleJobClick = (jobId: string) => {
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

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Available Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {mockJobs.length} job opportunities across Africa
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs available at the moment. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{job.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{getDaysAgo(job.postedAt)} day{getDaysAgo(job.postedAt) > 1 ? "s" : ""} ago</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={(e) => handleApplyClick(e, job.id)}
                    className="w-full"
                    variant="default"
                  >
                    {hasAccess ? "View & Apply" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Access Required</DialogTitle>
              <DialogDescription>
                To view full job details and apply, you need to either build your folio or grant access.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button onClick={() => window.location.href = "/build-folio"}>
                Build Your Folio
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/profile"}>
                Grant Access (Pay Fee)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Jobs;
