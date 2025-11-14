import { useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, folio, subscription, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    // If there was a permission error while fetching profile data, show a helpful message
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Unable to load profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We couldn't load your profile. This is often caused by
                  Firestore security rules that prevent the app from reading
                  your profile document, or the app may be connected to the
                  wrong Firebase project.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/auth")}>Sign In</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // attempt to refresh user data
                      // refreshUserData is obtained from useAuth below via destructuring in the component
                      // We'll call it using a window event to avoid changing the component signature here.
                      window.dispatchEvent(new CustomEvent("refreshUserData"));
                    }}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        "https://firebase.google.com/docs/firestore/security/get-started",
                        "_blank"
                      )
                    }
                  >
                    Firestore Rules Docs
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
      const endDate = subscription.trialEndDate.toDate();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const trialDaysLeft = getTrialDaysLeft();

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.profilePictureUrl}
                  alt={profile.firstName}
                />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {profile.email}
                </p>
                <div className="flex items-center gap-2">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload Status */}
        {hasFolio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Folio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">CV Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {folio?.cvUrl ? "Your CV is ready" : "No CV uploaded"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasAccess && trialDaysLeft === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">
                      No Active Subscription
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pay the access fee to view and apply for jobs
                    </p>
                  </div>
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
                <div className="flex items-center gap-3 text-warning">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Trial Period Active</p>
                    <p className="text-xs text-muted-foreground">
                      {trialDaysLeft} days remaining
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Active Subscription</p>
                    <p className="text-xs text-muted-foreground">
                      Expires on{" "}
                      {subscription?.subscriptionEndDate
                        ?.toDate()
                        .toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/payment")}
                >
                  Renew Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!hasFolio && (
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/build-folio")}
              >
                Build Your Folio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
