import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SettingsIndex = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage account and notification preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Control which emails you receive from JobFolio.
              </p>
              <Button onClick={() => navigate("/settings/email")}>
                Manage Email Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                In-app and push notification preferences.
              </p>
              <Button onClick={() => navigate("/settings/notifications")}>
                Manage Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsIndex;
