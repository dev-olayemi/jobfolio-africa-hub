/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, X, ArrowLeft } from "lucide-react";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Ethiopia",
  "Zambia",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Transportation",
  "Real Estate",
  "Hospitality",
  "Media",
  "Consulting",
  "Government",
  "Non-profit",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
];

const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior", "Executive"];

const PostJob = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const accountType = (profile as any)?.accountType;

  // Redirect if user is job seeker or doesn't have permission
  if (accountType === "jobseeker") {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-3 py-12">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                Only recruiters, companies, and employers can post jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState((profile as any)?.companyName || "");
  const [location, setLocation] = useState((profile as any)?.country || "");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to post a job");
      return;
    }

    if (!jobTitle || !company || !location || !jobType || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: jobTitle,
        company,
        location,
        jobType,
        experienceLevel: experienceLevel || null,
        salary: {
          min: salaryMin ? parseInt(salaryMin) : null,
          max: salaryMax ? parseInt(salaryMax) : null,
          currency: currency || "USD",
        },
        description,
        requirements,
        benefits,
        industry: industry || null,
        keywords,
        postedById: user.uid,
        posterName: (profile as any)?.firstName || "Unknown",
        posterType: accountType,
        status: "active",
        views: 0,
        likes: 0,
        applications: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "jobs"), jobData);
      toast.success("Job posted successfully!");
      navigate(`/jobs/${docRef.id}`);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast.error(error.message || "Failed to post job");
    } finally {
      setLoading(false);
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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post a Job</CardTitle>
            <CardDescription>
              Fill in the details below to post a new job opportunity
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="font-medium">
                      Job Title *
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior React Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="font-medium">
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-medium">
                      Location *
                    </Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="font-medium">
                      Industry
                    </Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold text-lg">Job Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType" className="font-medium">
                      Job Type *
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel" className="font-medium">
                      Experience Level
                    </Label>
                    <Select
                      value={experienceLevel}
                      onValueChange={setExperienceLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Salary Range</Label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                        />
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Max"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                        />
                      </div>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                          <SelectItem value="KES">KES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold text-lg">
                  Description & Requirements
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job role, responsibilities, and what you're looking for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="font-medium">
                    Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="List required skills, experience, qualifications, etc. (one per line)"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits" className="font-medium">
                    Benefits
                  </Label>
                  <Textarea
                    id="benefits"
                    placeholder="List benefits offered (one per line)"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-semibold text-lg">Keywords</h3>
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="font-medium">
                    Add relevant keywords for search
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="keywords"
                      placeholder="Add a keyword and press Enter or click Add"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddKeyword}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="gap-1"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/jobs")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Job
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PostJob;
