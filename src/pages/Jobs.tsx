import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp Africa",
    location: "Lagos, Nigeria",
    salary: "$50,000 - $70,000/year",
    category: "Technology",
    postedDays: 1,
  },
  {
    id: 2,
    title: "Hotel Manager",
    company: "Grand Hotel Group",
    location: "Nairobi, Kenya",
    salary: "$35,000 - $45,000/year",
    category: "Hospitality",
    postedDays: 2,
  },
  {
    id: 3,
    title: "Financial Analyst",
    company: "African Finance Ltd",
    location: "Accra, Ghana",
    salary: "$40,000 - $55,000/year",
    category: "Finance",
    postedDays: 3,
  },
  {
    id: 4,
    title: "Registered Nurse",
    company: "City Hospital",
    location: "Cape Town, South Africa",
    salary: "$30,000 - $40,000/year",
    category: "Healthcare",
    postedDays: 5,
  },
];

const Jobs = () => {
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const hasAccess = false; // This should come from user context/state

  const handleApplyClick = () => {
    if (!hasAccess) {
      setShowAccessDialog(true);
    }
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

        <div className="space-y-4">
          {mockJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
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
                    <span>{job.postedDays} day{job.postedDays > 1 ? "s" : ""} ago</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handleApplyClick}
                  className="w-full"
                  variant="default"
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

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
