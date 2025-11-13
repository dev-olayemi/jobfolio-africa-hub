import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Calendar, CheckCircle, XCircle, CreditCard } from "lucide-react";

const Profile = () => {
  // Mock user data - this should come from context/state
  const user = {
    name: "John Doe",
    email: "john@example.com",
    hasFolio: true,
    hasAccess: false,
    trialDaysLeft: 0,
    cvUploaded: true,
    selectedIndustries: ["Technology", "Finance", "Healthcare"],
    subscriptionExpiry: "2025-12-31",
  };

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
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                <div className="flex items-center gap-2">
                  {user.hasFolio ? (
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
                  {user.hasAccess ? (
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
        {user.hasFolio && (
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
                      {user.cvUploaded ? "Your CV is ready" : "No CV uploaded"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Selected Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {user.selectedIndustries.map((industry) => (
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
            {!user.hasAccess && user.trialDaysLeft === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">No Active Subscription</p>
                    <p className="text-xs text-muted-foreground">
                      Pay the access fee to view and apply for jobs
                    </p>
                  </div>
                </div>
                <Button className="w-full gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay Access Fee
                </Button>
              </div>
            ) : user.trialDaysLeft > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-warning">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Trial Period Active</p>
                    <p className="text-xs text-muted-foreground">
                      {user.trialDaysLeft} days remaining
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
                      Expires on {new Date(user.subscriptionExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Renew Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!user.hasFolio && (
          <Card>
            <CardContent className="pt-6">
              <Button className="w-full" size="lg" onClick={() => window.location.href = "/build-folio"}>
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
