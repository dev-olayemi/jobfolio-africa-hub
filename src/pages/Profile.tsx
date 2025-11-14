import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
  Mail,
  Shield,
  Trophy,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BADGE_DEFINITIONS = [
  {
    id: "new_user",
    name: "🆕 New User",
    description: "Just joined JobFolio",
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
    name: "✓ Verified User",
    description: "Email verified and profile complete",
    condition: (profile: any) => !!profile?.email,
  },
  {
    id: "cv_added",
    name: "📄 CV Added",
    description: "Uploaded their resume",
    condition: (profile: any, folio: any) => !!folio?.cvUrl,
  },
  {
    id: "one_year",
    name: "🎂 1+ Year Member",
    description: "Member for over a year",
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
    id: "folio_built",
    name: "🎯 Folio Complete",
    description: "Completed their professional folio",
    condition: (profile: any, folio: any) => !!folio?.industries?.length,
  },
  {
    id: "active_subscriber",
    name: "⭐ Active Subscriber",
    description: "Active premium membership",
    condition: (profile: any, folio: any, subscription: any) =>
      subscription?.status === "active",
  },
  {
    id: "trial_user",
    name: "🚀 Trial User",
    description: "Currently on trial period",
    condition: (profile: any, folio: any, subscription: any) =>
      subscription?.status === "trial",
  },
  {
    id: "many_applications",
    name: "📬 Active Applicant",
    description: "Applied to multiple jobs",
    condition: (profile: any) => (profile?.applicationCount || 0) >= 5,
  },
  {
    id: "admin",
    name: "🛡️ Admin",
    description: "System administrator",
    condition: (profile: any) => profile?.isAdmin,
  },
  {
    id: "industries_selected",
    name: "🏢 Industries Selected",
    description: "Selected job industries",
    condition: (profile: any, folio: any) => !!folio?.industries?.length,
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, folio, subscription, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState(profile?.country || "");
  const [badges, setBadges] = useState<string[]>(profile?.badges || []);
  const [newBadge, setNewBadge] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setCountry(profile?.country || "");
    setBadges(profile?.badges || []);
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
      const endDate =
        subscription.trialEndDate.toDate?.() ||
        new Date(subscription.trialEndDate);
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
      <div className="container max-w-5xl mx-auto px-3 md:px-4 py-6">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              My Profile
            </h1>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
            )}
          </div>

          {/* User Info Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-primary/50 flex-shrink-0">
                  <AvatarImage
                    src={profile.profilePictureUrl}
                    alt={profile.firstName}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1 mb-4">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>

                  {/* Quick Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hasFolio ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Folio Built
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        No Folio
                      </Badge>
                    )}
                    {hasAccess ? (
                      <Badge variant="default" className="gap-1 bg-success">
                        <CheckCircle className="h-3 w-3" />
                        Active Access
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        No Access
                      </Badge>
                    )}
                  </div>

                  {/* Location */}
                  {profile.country && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{profile.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Country & Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Country Selection */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Country
                  </label>
                  {isEditing ? (
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-md border border-input px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                      {profile.country || "Not set"}
                    </div>
                  )}
                </div>

                {/* Automatic Badges */}
                {automaticBadges.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Achievements
                    </label>
                    <div className="space-y-2">
                      {automaticBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
                        >
                          <div className="text-xl flex-shrink-0">
                            {badge.name.split(" ")[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {badge.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Badges */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Your Badges ({allBadges.length}/10)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allBadges.length > 0 ? (
                      allBadges.map((b) => (
                        <Badge key={b} className="flex items-center gap-2 h-8">
                          {b}
                          {isEditing && badges.includes(b) && (
                            <button
                              onClick={() => removeBadge(b)}
                              className="ml-1 hover:opacity-70"
                            >
                              ✕
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No badges yet
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        placeholder="Add custom badge"
                        className="rounded-md border border-input px-3 py-2 flex-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={30}
                      />
                      <Button
                        onClick={addBadge}
                        disabled={badges.length >= 10}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CV/Folio Card */}
            {hasFolio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Folio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-md border border-success/20">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">CV Uploaded</p>
                      <p className="text-xs text-muted-foreground">
                        Your resume is ready for employers
                      </p>
                    </div>
                  </div>

                  {folio.industries && folio.industries.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">
                        Selected Industries
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {folio.industries.map((industry) => (
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
          </div>

          {/* Right Column - Subscription & Actions */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasAccess && trialDaysLeft === 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center p-4 bg-destructive/10 rounded-md border border-destructive/20">
                      <XCircle className="h-8 w-8 text-destructive mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        No Active Subscription
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay to access job listings
                      </p>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => navigate("/payment")}
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay Access Fee
                    </Button>
                  </div>
                ) : trialDaysLeft > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center p-4 bg-amber-500/10 rounded-md border border-amber-500/20">
                      <Calendar className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        Trial Active
                      </p>
                      <p className="text-2xl font-bold text-amber-500 mt-1">
                        {trialDaysLeft}
                      </p>
                      <p className="text-xs text-muted-foreground">days left</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/payment")}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center p-4 bg-success/10 rounded-md border border-success/20">
                      <CheckCircle className="h-8 w-8 text-success mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        Active Subscription
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Until{" "}
                        {subscription?.subscriptionEndDate
                          ?.toDate?.()
                          .toLocaleDateString?.() ||
                          new Date(
                            subscription?.subscriptionEndDate
                          ).toLocaleDateString?.()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/payment")}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!hasFolio && (
              <Button
                className="w-full h-12"
                size="lg"
                onClick={() => navigate("/build-folio")}
              >
                Build Your Folio
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/jobs")}
            >
              Browse Jobs
            </Button>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 mt-8 sticky bottom-20 sm:bottom-0">
            <Button onClick={handleSave} className="flex-1" size="lg">
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
