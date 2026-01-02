/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  Briefcase,
  Award,
  BookOpen,
  PlusCircle,
  X,
  MapPin,
  Mail,
  Edit2,
  Save,
  Check,
  AlertCircle,
  TrendingUp,
  Globe,
  Download,
  FileText,
  Camera,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { downloadCVPDF } from "@/lib/cvGenerator";
import { uploadProfileImage } from "@/lib/imageUpload";
import { uploadToDrive } from "@/lib/driveUpload";
import { toast } from "sonner";

const BADGE_DEFINITIONS = [
  {
    id: "new_user",
    name: "New Member",
    description: "Just joined JobFolio",
    icon: Zap,
    condition: (profile: any) => {
      if (!profile?.createdAt) return false;
      const createdDate =
        profile.createdAt.toDate?.() || new Date(profile.createdAt);
      const daysSinceCreation =
        (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 7;
    },
  },
  {
    id: "verified_user",
    name: "Verified User",
    description: "Email verified and profile complete",
    icon: Check,
    condition: (profile: any) => !!profile?.email,
  },
  {
    id: "cv_added",
    name: "CV Added",
    description: "Professional folio created",
    icon: BookOpen,
    condition: (profile: any, folio: any) => !!folio?.industries?.length,
  },
  {
    id: "one_year",
    name: "1+ Year Member",
    description: "Member for over a year",
    icon: Award,
    condition: (profile: any) => {
      if (!profile?.createdAt) return false;
      const createdDate =
        profile.createdAt.toDate?.() || new Date(profile.createdAt);
      const daysSinceCreation =
        (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation >= 365;
    },
  },
  {
    id: "active_subscriber",
    name: "Active Subscriber",
    description: "Premium membership active",
    icon: TrendingUp,
    condition: (profile: any, folio: any, subscription: any) =>
      subscription?.status === "active",
  },
  {
    id: "trial_user",
    name: "Trial Member",
    description: "Currently on trial period",
    icon: Zap,
    condition: (profile: any, folio: any, subscription: any) =>
      subscription?.status === "trial",
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, folio, subscription, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState(profile?.country || "");
  const [badges, setBadges] = useState<string[]>(profile?.badges || []);
  const [newBadge, setNewBadge] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile?.profilePictureUrl || ""
  );
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [addingExp, setAddingExp] = useState(false);
  const [addingEdu, setAddingEdu] = useState(false);
  const [addingProj, setAddingProj] = useState(false);
  const [newExp, setNewExp] = useState({ title: "", company: "", startDate: "", endDate: "", description: "" });
  const [newEdu, setNewEdu] = useState({ school: "", degree: "", startYear: "", endYear: "", description: "" });
  const [newProj, setNewProj] = useState({ title: "", description: "", link: "", media: [] as string[] });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setCountry(profile?.country || "");
    setBadges(profile?.badges || []);
    setProfilePictureUrl(profile?.profilePictureUrl || "");
  }, [profile]);

  useEffect(() => {
    const fetchSubcollections = async () => {
      if (!user) return;
      try {
        const expSnap = await getDocs(collection(db, `profiles/${user.uid}/experiences`));
        setExperiences(expSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const eduSnap = await getDocs(collection(db, `profiles/${user.uid}/education`));
        setEducation(eduSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const projSnap = await getDocs(collection(db, `profiles/${user.uid}/projects`));
        setProjects(projSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load profile subcollections:", err);
      }
    };
    fetchSubcollections();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, { country, badges });
      window.dispatchEvent(new CustomEvent("refreshUserData"));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const addBadge = () => {
    const trimmed = newBadge.trim();
    if (!trimmed) return;
    if (badges.length >= 10) return;
    setBadges([...badges, trimmed]);
    setNewBadge("");
  };

  const addExperience = async () => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, `profiles/${user.uid}/experiences`), {
        ...newExp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setExperiences([{ id: ref.id, ...newExp }, ...experiences]);
      setNewExp({ title: "", company: "", startDate: "", endDate: "", description: "" });
      setAddingExp(false);
      toast.success("Experience added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add experience");
    }
  };

  const removeExperience = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `profiles/${user.uid}/experiences`, id));
      setExperiences(experiences.filter((e) => e.id !== id));
      toast.success("Experience removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove experience");
    }
  };

  const addEducation = async () => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, `profiles/${user.uid}/education`), {
        ...newEdu,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setEducation([{ id: ref.id, ...newEdu }, ...education]);
      setNewEdu({ school: "", degree: "", startYear: "", endYear: "", description: "" });
      setAddingEdu(false);
      toast.success("Education added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add education");
    }
  };

  const removeEducation = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `profiles/${user.uid}/education`, id));
      setEducation(education.filter((e) => e.id !== id));
      toast.success("Education removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove education");
    }
  };

  const handleProjectUpload = async (file: File) => {
    if (!user) return null;
    try {
      const res = await uploadToDrive(file, user.uid);
      const url = res?.link || res?.url || (res?.fileId ? `https://drive.google.com/uc?export=view&id=${res.fileId}` : null);
      return url;
    } catch (err) {
      console.error("Project upload failed, falling back to client upload", err);
      const r = await uploadProfileImage(file);
      return r.success && r.data ? r.data : null;
    }
  };

  const addProject = async () => {
    if (!user) return;
    try {
      const payload = {
        ...newProj,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, `profiles/${user.uid}/projects`), payload);
      setProjects([{ id: ref.id, ...newProj }, ...projects]);
      setNewProj({ title: "", description: "", link: "", media: [] });
      setAddingProj(false);
      toast.success("Project added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add project");
    }
  };

  const removeProject = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `profiles/${user.uid}/projects`, id));
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove project");
    }
  };

  const removeBadge = (b: string) => {
    setBadges(badges.filter((x) => x !== b));
  };

  const handleUploadProfilePicture = async () => {
    setIsUploadingPicture(true);
    try {
      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          setIsUploadingPicture(false);
          return;
        }

        try {
          // Prefer server-side Drive upload if available
          if (user) {
            try {
              const res = await uploadToDrive(file, user.uid);
              const link =
                res?.link || res?.url || res?.fileId
                  ? res.link ||
                    (res.fileId
                      ? `https://drive.google.com/uc?export=view&id=${res.fileId}`
                      : undefined)
                  : undefined;

              if (link) {
                const profileRef = doc(db, "profiles", user.uid);
                await updateDoc(profileRef, {
                  profilePictureUrl: link,
                });

                setProfilePictureUrl(link);
                toast.success("Profile picture updated successfully!");
                window.dispatchEvent(new CustomEvent("refreshUserData"));
                setIsUploadingPicture(false);
                return;
              }
            } catch (driveErr) {
              console.warn(
                "Drive upload failed, falling back to client upload:",
                driveErr
              );
            }
          }

          // Fallback: client-side base64 upload
          const result = await uploadProfileImage(file);

          if (result.success && result.data && user) {
            const profileRef = doc(db, "profiles", user.uid);
            await updateDoc(profileRef, {
              profilePictureUrl: result.data,
            });

            setProfilePictureUrl(result.data);
            toast.success("Profile picture updated successfully!");
            window.dispatchEvent(new CustomEvent("refreshUserData"));
          } else {
            toast.error(result.error || "Failed to upload profile picture");
          }
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to upload profile picture"
          );
        } finally {
          setIsUploadingPicture(false);
        }
      };

      input.click();
    } catch (error) {
      console.error("Error opening file dialog:", error);
      setIsUploadingPicture(false);
    }
  };

  // Get automatic badges based on conditions
  const getAutomaticBadges = () => {
    return BADGE_DEFINITIONS.filter((badge) =>
      badge.condition(profile, folio, subscription)
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto px-3 md:px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto px-3 md:px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Unable to load profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We couldn't load your profile. This is often caused by
                  Firestore security rules that prevent the app from reading
                  your profile document.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate("/auth")}>Sign In</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("refreshUserData"));
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const hasFolio = !!folio;
  const hasAccess =
    subscription &&
    (subscription.status === "trial" || subscription.status === "active");

  const computeProfileCompleteness = () => {
    let score = 0;
    if (profile?.firstName) score += 15;
    if (profile?.lastName) score += 15;
    if (profile?.profilePictureUrl) score += 20;
    if (folio?.skills?.length) score += 20;
    if (folio?.industries?.length) score += 15;
    if (profile?.email) score += 15;
    return Math.min(100, score);
  };

  const profileCompleteness = computeProfileCompleteness();

  const getTrialDaysLeft = () => {
    if (subscription?.status === "trial" && subscription.trialEndDate) {
      const now = new Date();
      const endDate = subscription.trialEndDate.toDate
        ? subscription.trialEndDate.toDate()
        : new Date(subscription.trialEndDate.seconds * 1000);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const trialDaysLeft = getTrialDaysLeft();
  const automaticBadges = getAutomaticBadges();
  const allBadges = [...automaticBadges.map((b) => b.name), ...badges];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
        <div className="container max-w-6xl mx-auto px-3 md:px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your professional information and public folio</p>
            </div>
            <div className="ml-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="h-10 px-4">
                  <Edit2 className="h-4 w-4 mr-2" /> Edit profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="h-10 px-4 bg-primary text-white">Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="h-10 px-4">Cancel</Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Header Card */}
          <Card className="mb-8 rounded-xl shadow-sm overflow-hidden">
            <div className="h-28 sm:h-32 bg-gradient-to-r from-primary/70 to-accent/70 opacity-90" />
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 relative z-10 pb-6">
                <div className="relative flex-shrink-0 group">
                  <Avatar className="h-36 w-36 sm:h-40 sm:w-40 rounded-2xl border-4 border-background shadow-lg">
                    <AvatarImage
                      src={profilePictureUrl}
                      alt={profile.firstName}
                    />
                    <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold rounded-2xl">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleUploadProfilePicture}
                    disabled={isUploadingPicture}
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-full p-3 shadow-lg transition-all group-hover:scale-110"
                    title="Upload profile picture"
                  >
                    {isUploadingPicture ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-1">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {profile.headline || profile.title || "Job seeker & professional"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Profile</div>
                      <div className="mt-1 text-sm font-semibold">{profileCompleteness}% complete</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    {profile.country && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                  </div>

                  {folio?.skills && folio.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {folio.skills.slice(0, 8).map((s: string) => (
                          <Badge key={s} variant="outline" className="px-3 py-1">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Achievements */}
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {automaticBadges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {automaticBadges.map((badge) => {
                        const IconComponent = badge.icon;
                        return (
                          <div
                            key={badge.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="mt-1">
                              <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {badge.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                        <div className="text-center py-8">
                          <Award className="h-12 w-12 text-muted mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Achievements will appear here as you use the platform</p>
                        </div>
                  )}
                </CardContent>
              </Card>
              {/*  */}
              {/* Professional Folio */}
                  {hasFolio && folio && (
                    <Card className="rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Professional Folio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Folio Complete
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your professional profile is ready
                        </p>
                      </div>
                    </div>

                    {folio.industries && folio.industries.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3">Industries</p>
                        <div className="flex flex-wrap gap-2">
                          {folio.industries.map((industry) => (
                            <Badge
                              key={industry}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {folio.skills && folio.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3">Top Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {folio.skills.slice(0, 5).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {folio.skills.length > 5 && (
                            <Badge variant="secondary" className="px-3 py-1">
                              +{folio.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CV Download Button */}
                          <div className="pt-2 border-t">
                            <Button
                              onClick={() => {
                                const cvData = {
                                  personalInfo: {
                                    fullName: `${profile.firstName} ${profile.lastName}`,
                                    email: profile.email,
                                    phone: folio?.personalInfo?.phone,
                                    location: folio?.personalInfo?.location,
                                    summary: folio?.personalInfo?.summary,
                                  },
                                  skills: folio?.skills || [],
                                  education: folio?.education || [],
                                  experience: folio?.experience || [],
                                };
                                downloadCVPDF(cvData);
                              }}
                              className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-10"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                              Download CV as PDF
                            </Button>
                          </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Builder: Experiences, Education, Projects */}
              <Card className="border-0 shadow-md mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Career Builder</span>
                    <span className="text-sm text-muted-foreground">Create a profile companies will trust</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Experiences */}
                  <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Experience</h4>
                        <Button size="sm" variant="outline" onClick={() => setAddingExp((s) => !s)}>
                          {addingExp ? "Close" : "Add"}
                        </Button>
                      </div>

                    {addingExp && (
                      <div className="space-y-2 mb-3">
                        <Input placeholder="Job title" value={newExp.title} onChange={(e) => setNewExp({...newExp, title: e.target.value})} />
                        <Input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input placeholder="Start date (YYYY-MM)" value={newExp.startDate} onChange={(e) => setNewExp({...newExp, startDate: e.target.value})} />
                          <Input placeholder="End date (YYYY-MM or Present)" value={newExp.endDate} onChange={(e) => setNewExp({...newExp, endDate: e.target.value})} />
                        </div>
                        <textarea className="w-full rounded-md border px-3 py-2" placeholder="Short description" value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} />
                        <div className="flex gap-2">
                          <Button onClick={addExperience} size="sm">Add Experience</Button>
                          <Button variant="outline" size="sm" onClick={() => setAddingExp(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {experiences.map((e) => (
                        <div key={e.id} className="p-3 rounded-lg border border-border/40 flex items-start justify-between">
                          <div>
                            <div className="font-medium">{e.title} {e.company ? `• ${e.company}` : ''}</div>
                            <div className="text-xs text-muted-foreground">{e.startDate} — {e.endDate || 'Present'}</div>
                            {e.description && <div className="text-sm mt-1 text-muted-foreground">{e.description}</div>}
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" onClick={() => removeExperience(e.id)}>Remove</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Education</h4>
                      <Button size="sm" onClick={() => setAddingEdu((s) => !s)}>
                        {addingEdu ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                    {addingEdu && (
                      <div className="space-y-2 mb-3">
                        <Input placeholder="School" value={newEdu.school} onChange={(e) => setNewEdu({...newEdu, school: e.target.value})} />
                        <Input placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input placeholder="Start year" value={newEdu.startYear} onChange={(e) => setNewEdu({...newEdu, startYear: e.target.value})} />
                          <Input placeholder="End year" value={newEdu.endYear} onChange={(e) => setNewEdu({...newEdu, endYear: e.target.value})} />
                        </div>
                        <textarea className="w-full rounded-md border px-3 py-2" placeholder="Notes" value={newEdu.description} onChange={(e) => setNewEdu({...newEdu, description: e.target.value})} />
                        <div className="flex gap-2">
                          <Button onClick={addEducation} size="sm">Add Education</Button>
                          <Button variant="outline" size="sm" onClick={() => setAddingEdu(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {education.map((ed) => (
                        <div key={ed.id} className="p-3 border rounded-md flex items-start justify-between">
                          <div>
                            <div className="font-medium">{ed.school} {ed.degree ? `• ${ed.degree}` : ''}</div>
                            <div className="text-xs text-muted-foreground">{ed.startYear} — {ed.endYear || ''}</div>
                            {ed.description && <div className="text-sm mt-1 text-muted-foreground">{ed.description}</div>}
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" onClick={() => removeEducation(ed.id)}>Remove</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Projects</h4>
                      <Button size="sm" onClick={() => setAddingProj((s) => !s)}>
                        {addingProj ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                      </Button>
                    </div>

                    {addingProj && (
                      <div className="space-y-2 mb-3">
                        <Input placeholder="Project title" value={newProj.title} onChange={(e) => setNewProj({...newProj, title: e.target.value})} />
                        <Input placeholder="Link (optional)" value={newProj.link} onChange={(e) => setNewProj({...newProj, link: e.target.value})} />
                        <textarea className="w-full rounded-md border px-3 py-2" placeholder="Short description" value={newProj.description} onChange={(e) => setNewProj({...newProj, description: e.target.value})} />
                        <div className="flex items-center gap-2">
                          <input type="file" accept="image/*,video/*" onChange={async (ev) => {
                            const file = ev.target.files?.[0];
                            if (!file) return;
                            const url = await handleProjectUpload(file);
                            if (url) setNewProj({...newProj, media: [...newProj.media, url]});
                          }} />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={addProject} size="sm">Add Project</Button>
                          <Button variant="outline" size="sm" onClick={() => setAddingProj(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {projects.map((p) => (
                        <div key={p.id} className="p-3 border rounded-md">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{p.title}</div>
                              {p.link && <a href={p.link} className="text-xs text-primary hover:underline">{p.link}</a>}
                              {p.description && <div className="text-sm mt-1 text-muted-foreground">{p.description}</div>}
                            </div>
                            <div>
                              <Button variant="ghost" size="sm" onClick={() => removeProject(p.id)}>Remove</Button>
                            </div>
                          </div>
                          {p.media && p.media.length > 0 && (
                            <div className="mt-2 flex gap-2 overflow-x-auto">
                              {p.media.map((m: string, idx: number) => (
                                <img key={idx} src={m} className="h-20 w-32 object-cover rounded" alt={`media-${idx}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Settings */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-md border border-input px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select country</option>
                      {[
                        "Nigeria",
                        "Ghana",
                        "Kenya",
                        "South Africa",
                        "Rwanda",
                        "Tanzania",
                        "Uganda",
                        "Ethiopia",
                        "Zambia",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="inline-block px-4 py-2 bg-muted rounded-md">
                      <p className="text-sm font-medium text-foreground">
                        {profile.country || "Not set"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Subscription Status */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Access Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasAccess && trialDaysLeft === 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                        <p className="text-sm font-semibold text-foreground">
                          No Access
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Subscribe to apply for jobs
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => navigate("/payment")}
                      >
                        Subscribe Now
                      </Button>
                    </div>
                  ) : trialDaysLeft > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Zap className="h-8 w-8 text-amber-500 mb-2" />
                        <p className="text-sm font-semibold text-foreground">
                          Trial Active
                        </p>
                        <p className="text-3xl font-bold text-amber-500 mt-2">
                          {trialDaysLeft}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          days remaining
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/payment")}
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center p-4 bg-success/10 rounded-lg border border-success/20">
                        <Check className="h-8 w-8 text-success mb-2" />
                        <p className="text-sm font-semibold text-foreground">
                          Premium Active
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Full access to all features
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/payment")}
                      >
                        Manage
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {!hasFolio && (
                <Button
                  className="w-full h-12 text-base shadow-md"
                  onClick={() => navigate("/build-folio")}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Build Folio
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/jobs")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
              <Button
                variant="ghost"
                className="w-full h-11 mt-2"
                onClick={() => navigate("/settings")}
              >
                Account Settings
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 mt-2"
                onClick={() => navigate("/select-account-type")}
              >
                Change Account Type
              </Button>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="fixed bottom-6 left-0 right-0 px-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-6xl mx-auto">
                <Button
                  onClick={handleSave}
                  className="flex-1 h-12 shadow-lg"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
