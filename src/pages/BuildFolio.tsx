import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Hospitality",
  "Education",
  "Construction",
  "Retail",
  "Manufacturing",
  "Transportation",
  "Agriculture",
];

const BuildFolio = () => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleIndustryToggle = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
    } else {
      if (selectedIndustries.length < 4) {
        setSelectedIndustries([...selectedIndustries, industry]);
      } else {
        toast.error("You can select up to 4 industries only");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setCvFile(file);
      toast.success("CV uploaded successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFile) {
      toast.error("Please upload your CV");
      return;
    }

    if (selectedIndustries.length < 3) {
      toast.error("Please select at least 3 industries");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
      toast.success("Folio created! Check your email for trial activation");
    }, 2000);
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Folio Created Successfully!</CardTitle>
              <CardDescription>
                Your 3-day trial has been activated. Check your email for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can now access job listings and apply to positions that match your selected industries.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => window.location.href = "/jobs"}>
                    Browse Jobs
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = "/profile"}>
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Build Your Folio</h1>
          <p className="text-sm text-muted-foreground">
            Upload your CV and select your preferred industries to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your CV</CardTitle>
              <CardDescription>
                Upload your resume in PDF, DOC, or DOCX format (Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="cv-upload" className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {cvFile ? cvFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX up to 5MB
                    </p>
                  </div>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Industry Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Industries</CardTitle>
              <CardDescription>
                Choose 3-4 industries you're interested in. Jobs will be filtered based on your selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={selectedIndustries.includes(industry)}
                      onCheckedChange={() => handleIndustryToggle(industry)}
                    />
                    <Label
                      htmlFor={industry}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Selected: {selectedIndustries.length} / 4
              </p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || !cvFile || selectedIndustries.length < 3}
          >
            {isSubmitting ? "Creating Folio..." : "Create Folio & Start Trial"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default BuildFolio;
