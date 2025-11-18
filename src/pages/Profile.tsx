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
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { downloadCVPDF } from "@/lib/cvGenerator";
import { uploadProfilePicture } from "@/lib/filestack";
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

  const removeBadge = (b: string) => {
    setBadges(badges.filter((x) => x !== b));
  };

  const handleUploadProfilePicture = async () => {
    setIsUploadingPicture(true);
    try {
      const response = await uploadProfilePicture();
      if (response && user) {
        // Save both the handle and optimized URL to Firestore
        const profileRef = doc(db, "profiles", user.uid);

        // Store the raw CDN URL as backup
        const rawUrl = `https://cdn.filestackcontent.com/${response.handle}`;

        await updateDoc(profileRef, {
          profilePictureUrl: rawUrl,
        });

        setProfilePictureUrl(rawUrl);
        toast.success("Profile picture updated successfully!");
        window.dispatchEvent(new CustomEvent("refreshUserData"));
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-1">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your professional information
              </p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
          </div>

          {/* Profile Header Card */}
          <Card className="mb-8 border-0 shadow-lg">
            <div className="h-32 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 relative z-10 pb-6">
                <div className="relative flex-shrink-0 group">
                  <Avatar className="h-40 w-40 rounded-2xl border-4 border-background shadow-lg">
                    <AvatarImage
                      src={profilePictureUrl}
                      alt={profile.firstName}
                      onError={(e) => {
                        // If the optimized URL fails, try the raw URL
                        const img = e.target as HTMLImageElement;
                        if (
                          profilePictureUrl &&
                          profilePictureUrl.includes("resize")
                        ) {
                          // Extract handle from URL and try raw version
                          const handleMatch =
                            profilePictureUrl.match(/\/([A-Za-z0-9]+)$/);
                          if (handleMatch) {
                            img.src = `https://cdn.filestackcontent.com/${handleMatch[1]}`;
                          }
                        }
                      }}
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.country && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Achievements */}
              <Card className="border-0 shadow-md">
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
                      <p className="text-sm text-muted-foreground">
                        Achievements will appear here as you use the platform
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/*  */}
              {/* Professional Folio */}
              {hasFolio && folio && (
                <Card className="border-0 shadow-md">
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
                        className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                        Download CV as PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
