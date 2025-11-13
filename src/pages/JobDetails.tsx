import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Building2, Calendar, Mail, Phone, ExternalLink, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job } from "@/lib/firebase-types";
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

  const hasAccess = subscription && (subscription.status === 'trial' || subscription.status === 'active');

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
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
  }, [id, navigate]);

  const handleApply = () => {
    if (!hasAccess) {
      setShowAccessDialog(true);
      return;
    }

    if (job?.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    } else if (job?.contactEmail) {
      window.location.href = `mailto:${job.contactEmail}`;
    } else {
      toast.success("Application submitted successfully!");
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
                    <span>{job.location}, {job.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {job.postedAt.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {job.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {hasAccess ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
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
                  <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {job.contactEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${job.contactEmail}`} className="hover:text-primary">
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                    {job.contactPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${job.contactPhone}`} className="hover:text-primary">
                          {job.contactPhone}
                        </a>
                      </div>
                    )}
                    {job.applicationUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          Application Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleApply} size="lg" className="w-full">
                  Apply Now
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <p className="text-lg font-medium mb-2">Access Required</p>
                  <p className="text-muted-foreground">
                    To view full job details and contact information, you need to build your folio or have an active subscription.
                  </p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={() => navigate("/build-folio")}>
                    Build Your Folio
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/profile")}>
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
                To apply for jobs, you need to either build your folio or have an active subscription.
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
