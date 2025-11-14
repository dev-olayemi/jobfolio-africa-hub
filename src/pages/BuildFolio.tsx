/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CheckCircle,
  Loader2,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

interface EducationEntry {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface ExperienceEntry {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

const BuildFolio = () => {
  const navigate = useNavigate();
  const { user, folio, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Education form state
  const [educationForm, setEducationForm] = useState<EducationEntry>({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  // Experience form state
  const [experienceForm, setExperienceForm] = useState<ExperienceEntry>({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
    if (folio) {
      navigate("/profile");
    }
  }, [user, folio, navigate]);

  // Step 1: CV and Industries
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

  // Skills
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.length >= 20) {
      toast.error("Maximum 20 skills allowed");
      return;
    }
    if (skills.includes(trimmed)) {
      toast.error("This skill is already added");
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Education
  const addEducation = () => {
    if (
      !educationForm.school ||
      !educationForm.degree ||
      !educationForm.field ||
      !educationForm.startDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setEducation([
      ...education,
      { ...educationForm, id: Math.random().toString(36).substr(2, 9) },
    ]);
    setEducationForm({
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    toast.success("Education added");
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  // Experience
  const addExperience = () => {
    if (
      !experienceForm.company ||
      !experienceForm.position ||
      !experienceForm.startDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setExperience([
      ...experience,
      { ...experienceForm, id: Math.random().toString(36).substr(2, 9) },
    ]);
    setExperienceForm({
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    toast.success("Experience added");
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    if (!cvFile) {
      toast.error("Please upload your CV");
      return;
    }

    if (selectedIndustries.length < 1) {
      toast.error("Please select at least 1 industry");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV
      let cvUrl: string;
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        try {
          cvUrl = await uploadToCloudinary(cvFile);
        } catch (err: any) {
          const msg = err?.message || String(err);
          console.error("Cloudinary upload error:", err);
          if (
            msg.includes("Upload preset not found") ||
            msg.includes("preset")
          ) {
            toast.error(
              "Cloudinary preset not found — falling back to Firebase Storage"
            );
          } else {
            toast.error(
              "Cloudinary upload failed, falling back to Firebase Storage"
            );
          }
          const storageRef = ref(storage, `cvs/${user.uid}/${cvFile.name}`);
          await uploadBytes(storageRef, cvFile);
          cvUrl = await getDownloadURL(storageRef);
        }
      } else {
        const storageRef = ref(storage, `cvs/${user.uid}/${cvFile.name}`);
        await uploadBytes(storageRef, cvFile);
        cvUrl = await getDownloadURL(storageRef);
      }

      // Create folio document with all details
      const folioData = {
        userId: user.uid,
        cvUrl,
        cvFileName: cvFile.name,
        industries: selectedIndustries,
        skills: skills,
        education: education.map((e) => ({
          ...e,
          id: Math.random().toString(36).substr(2, 9),
        })),
        experience: experience.map((e) => ({
          ...e,
          id: Math.random().toString(36).substr(2, 9),
        })),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "folios"), folioData);

      // Create trial subscription
      const trialStartDate = Timestamp.now();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);

      const subscriptionData = {
        userId: user.uid,
        status: "trial",
        trialStartDate,
        trialEndDate: Timestamp.fromDate(trialEndDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "subscriptions", user.uid), subscriptionData);

      await refreshUserData();
      setIsComplete(true);
      toast.success("Folio created! Your 3-day trial has been activated.");
    } catch (error) {
      console.error("Error creating folio:", error);
      toast.error("Failed to create folio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-3xl">
                Professional Folio Created! 🎉
              </CardTitle>
              <CardDescription>
                Your comprehensive job profile is ready. Your 3-day trial has
                been activated!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can now access job listings, explore opportunities that
                  match your profile, and start applying to positions in your
                  preferred industries.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/jobs")} size="lg">
                    Browse Jobs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    size="lg"
                  >
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
      <div className="container max-w-4xl mx-auto px-3 md:px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Build Your Professional Folio
          </h1>
          <p className="text-muted-foreground">
            Create a comprehensive job profile to unlock career opportunities
            across Africa
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { num: 1, label: "CV & Industries" },
              { num: 2, label: "Skills" },
              { num: 3, label: "Education" },
              { num: 4, label: "Experience" },
              { num: 5, label: "Review" },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold text-sm transition-all ${
                    currentStep >= step.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.num ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    currentStep >= step.num
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {step.num < 5 && (
                  <div
                    className={`h-0.5 w-4 mx-1 ${
                      currentStep > step.num ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: CV and Industries */}
          {currentStep === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your CV</CardTitle>
                  <CardDescription>
                    Upload your resume in PDF, DOC, or DOCX format (Max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="cv-upload" className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/30">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {cvFile
                          ? cvFile.name
                          : "Click to upload or drag and drop"}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Industries</CardTitle>
                  <CardDescription>
                    Choose at least 1 industry (up to 4)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <div
                        key={industry}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleIndustryToggle(industry)}
                      >
                        <Checkbox
                          checked={selectedIndustries.includes(industry)}
                          onCheckedChange={() => handleIndustryToggle(industry)}
                        />
                        <Label className="text-sm font-medium cursor-pointer flex-1">
                          {industry}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Selected: {selectedIndustries.length} / 4{" "}
                    {selectedIndustries.length === 0 && "(Required)"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Skills */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Your Skills</CardTitle>
                <CardDescription>
                  List your professional skills (optional, up to 20)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Python, Project Management, Data Analysis"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button onClick={addSkill} type="button" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Your Skills ({skills.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge
                          key={`skill-${index}-${skill}`}
                          variant="secondary"
                          className="gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="hover:opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Add Education</CardTitle>
                  <CardDescription>
                    Share your academic background and qualifications (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>School/University *</Label>
                      <Input
                        placeholder="University of Lagos"
                        value={educationForm.school}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            school: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree *</Label>
                      <Input
                        placeholder="Bachelor"
                        value={educationForm.degree}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            degree: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study *</Label>
                      <Input
                        placeholder="Computer Science"
                        value={educationForm.field}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            field: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={educationForm.startDate}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={educationForm.endDate}
                        onChange={(e) =>
                          setEducationForm({
                            ...educationForm,
                            endDate: e.target.value,
                          })
                        }
                        disabled={educationForm.current}
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-study"
                          checked={educationForm.current}
                          onCheckedChange={() =>
                            setEducationForm({
                              ...educationForm,
                              current: !educationForm.current,
                              endDate: "",
                            })
                          }
                        />
                        <Label htmlFor="current-study" className="text-sm">
                          Currently studying
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Additional details about your education"
                      value={educationForm.description}
                      onChange={(e) =>
                        setEducationForm({
                          ...educationForm,
                          description: e.target.value,
                        })
                      }
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addEducation}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </CardContent>
              </Card>

              {education.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Added Education ({education.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-3 border border-border rounded-lg flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {edu.degree} in {edu.field}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.school}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.startDate}
                            {edu.endDate ? ` - ${edu.endDate}` : " - Present"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id!)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 4: Experience */}
          {currentStep === 4 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Add Work Experience</CardTitle>
                  <CardDescription>
                    Share your professional work history (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        placeholder="Google"
                        value={experienceForm.company}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <Input
                        placeholder="Senior Developer"
                        value={experienceForm.position}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            position: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="San Francisco, CA"
                        value={experienceForm.location}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={experienceForm.startDate}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={experienceForm.endDate}
                        onChange={(e) =>
                          setExperienceForm({
                            ...experienceForm,
                            endDate: e.target.value,
                          })
                        }
                        disabled={experienceForm.current}
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-job"
                          checked={experienceForm.current}
                          onCheckedChange={() =>
                            setExperienceForm({
                              ...experienceForm,
                              current: !experienceForm.current,
                              endDate: "",
                            })
                          }
                        />
                        <Label htmlFor="current-job" className="text-sm">
                          Currently working here
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements"
                      value={experienceForm.description}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          description: e.target.value,
                        })
                      }
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addExperience}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>

              {experience.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Added Experience ({experience.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3 border border-border rounded-lg flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {exp.position} at {exp.company}
                          </p>
                          {exp.location && (
                            <p className="text-xs text-muted-foreground">
                              {exp.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate}
                            {exp.endDate ? ` - ${exp.endDate}` : " - Present"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(exp.id!)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Profile</CardTitle>
                  <CardDescription>
                    Make sure everything looks good before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      CV
                    </Label>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      {cvFile?.name}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Industries
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustries.map((industry) => (
                        <Badge key={industry}>{industry}</Badge>
                      ))}
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Skills ({skills.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge
                            key={`review-skill-${index}-${skill}`}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Education ({education.length})
                      </Label>
                      <div className="space-y-2">
                        {education.map((edu) => (
                          <div
                            key={edu.id}
                            className="text-sm text-muted-foreground"
                          >
                            • {edu.degree} in {edu.field} from {edu.school}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Experience ({experience.length})
                      </Label>
                      <div className="space-y-2">
                        {experience.map((exp) => (
                          <div
                            key={exp.id}
                            className="text-sm text-muted-foreground"
                          >
                            • {exp.position} at {exp.company}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            {currentStep < 5 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="gap-2"
                disabled={
                  currentStep === 1 &&
                  (!cvFile || selectedIndustries.length < 1)
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {currentStep === 5 && (
              <Button
                type="submit"
                size="lg"
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating Folio..." : "Complete & Start Trial"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BuildFolio;
