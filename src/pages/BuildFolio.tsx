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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Education, Experience } from "@/lib/firebase-types";

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
  const navigate = useNavigate();
  const { user, folio, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Personal info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });

  // Education form state
  const [educationForm, setEducationForm] = useState<Education>({
    id: "",
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  // Experience form state
  const [experienceForm, setExperienceForm] = useState<Experience>({
    id: "",
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

  // Step 1: Industries - FIXED: Use stable state setter
  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries((prev) => {
      if (prev.includes(industry)) {
        return prev.filter((i) => i !== industry);
      } else {
        if (prev.length < 4) {
          return [...prev, industry];
        } else {
          toast.error("You can select up to 4 industries only");
          return prev;
        }
      }
    });
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
      id: "",
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
      id: "",
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

    if (selectedIndustries.length < 1) {
      toast.error("Please select at least 1 industry");
      return;
    }

    if (!personalInfo.fullName || !personalInfo.email) {
      toast.error("Please fill in your personal information");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create folio document with all details
      const folioData = {
        userId: user.uid,
        cvUrl: "", // No file upload, CV is generated from form data
        cvFileName: `${personalInfo.fullName.replace(/\s+/g, "_")}_CV`,
        industries: selectedIndustries,
        skills: skills,
        education: education,
        experience: experience,
        personalInfo: personalInfo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const folioRef = doc(db, "folios", user.uid);
      await setDoc(folioRef, folioData);

      // Create trial subscription
      const subscriptionData = {
        userId: user.uid,
        status: "trial" as const,
        trialStartDate: Timestamp.now(),
        trialEndDate: Timestamp.fromDate(
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        ),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const subscriptionRef = doc(db, "subscriptions", user.uid);
      await setDoc(subscriptionRef, subscriptionData);

      setIsComplete(true);
      await refreshUserData();

      toast.success("Your professional profile has been created successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error creating folio:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedIndustries.length >= 1;
      case 2:
        return personalInfo.fullName && personalInfo.email;
      case 3:
        return skills.length > 0;
      case 4:
        return education.length > 0;
      case 5:
        return experience.length > 0;
      default:
        return true;
    }
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Profile Created Successfully!
              </h2>
              <p className="text-muted-foreground mb-2">
                Your professional profile is ready
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You now have a 3-day trial with full access to job listings
              </p>
              <Button onClick={() => navigate("/profile")} size="lg">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              Build Your Professional Profile
            </h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 6
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Industries */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Industries</CardTitle>
                <CardDescription>
                  Choose 1-4 industries you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {industries.map((industry, index) => (
                    <button
                      key={`industry-${index}`}
                      type="button"
                      onClick={() => handleIndustryToggle(industry)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedIndustries.includes(industry)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border transition-all flex-shrink-0 ${
                            selectedIndustries.includes(industry)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">{industry}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedIndustries.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 block">
                      Selected ({selectedIndustries.length}/4)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustries.map((industry) => (
                        <Badge key={industry} variant="secondary">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+234 800 000 0000"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Lagos, Nigeria"
                      value={personalInfo.location}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Professional Summary</Label>
                  <Textarea
                    placeholder="Brief overview of your professional background and career objectives..."
                    rows={4}
                    value={personalInfo.summary}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        summary: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Skills */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>
                  Add your key professional skills (add at least 3)
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

          {/* Step 4: Education */}
          {currentStep === 4 && (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Add Education</CardTitle>
                  <CardDescription>
                    Share your academic background (add at least 1)
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
                        placeholder="Bachelor of Science"
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
                        type="month"
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
                        type="month"
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
                      <button
                        type="button"
                        onClick={() =>
                          setEducationForm({
                            ...educationForm,
                            current: !educationForm.current,
                            endDate: !educationForm.current
                              ? ""
                              : educationForm.endDate,
                          })
                        }
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-4 h-4 rounded border transition-all ${
                            educationForm.current
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        <span>Currently studying here</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Achievements, coursework, activities..."
                      rows={3}
                      value={educationForm.description}
                      onChange={(e) =>
                        setEducationForm({
                          ...educationForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={addEducation}
                    type="button"
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
                    <CardTitle>Your Education ({education.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-4 border rounded-lg space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {edu.degree} in {edu.field}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {edu.school}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {edu.startDate} -{" "}
                              {edu.current ? "Present" : edu.endDate}
                            </p>
                            {edu.description && (
                              <p className="text-sm mt-2">{edu.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 5: Experience */}
          {currentStep === 5 && (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Add Work Experience</CardTitle>
                  <CardDescription>
                    Share your professional work history (add at least 1)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        placeholder="Acme Inc."
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
                        placeholder="Software Engineer"
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
                        placeholder="Lagos, Nigeria"
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
                        type="month"
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
                        type="month"
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
                      <button
                        type="button"
                        onClick={() =>
                          setExperienceForm({
                            ...experienceForm,
                            current: !experienceForm.current,
                            endDate: !experienceForm.current
                              ? ""
                              : experienceForm.endDate,
                          })
                        }
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-4 h-4 rounded border transition-all ${
                            experienceForm.current
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        <span>Currently working here</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Your key responsibilities and achievements..."
                      rows={3}
                      value={experienceForm.description}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={addExperience}
                    type="button"
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
                    <CardTitle>Your Experience ({experience.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 border rounded-lg space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{exp.position}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exp.company}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exp.startDate} -{" "}
                              {exp.current ? "Present" : exp.endDate}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-4">
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
                      Industries ({selectedIndustries.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustries.map((industry) => (
                        <Badge key={industry} variant="secondary">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Personal Information
                    </Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Name:</strong> {personalInfo.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {personalInfo.email}
                      </p>
                      {personalInfo.phone && (
                        <p>
                          <strong>Phone:</strong> {personalInfo.phone}
                        </p>
                      )}
                      {personalInfo.location && (
                        <p>
                          <strong>Location:</strong> {personalInfo.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Skills ({skills.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <Badge key={`${skill}-${idx}`} variant="outline">
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
            {currentStep < 6 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="gap-2"
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {currentStep === 6 && (
              <Button
                type="submit"
                size="lg"
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? "Creating Profile..."
                  : "Create Profile & Start Trial"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BuildFolio;
