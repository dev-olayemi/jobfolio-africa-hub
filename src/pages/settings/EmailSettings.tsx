import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const EmailSettings = () => {
  const { user, profile } = useAuth();
  const [newsletter, setNewsletter] = useState(false);
  const [applications, setApplications] = useState(false);
  const [offers, setOffers] = useState(false);

  useEffect(() => {
    const settings = (profile as any)?.settings || {};
    setNewsletter(Boolean(settings.emailNewsletter));
    setApplications(Boolean(settings.emailApplications));
    setOffers(Boolean(settings.emailOffers));
  }, [profile]);

  const save = async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        settings: {
          ...((profile as any)?.settings || {}),
          emailNewsletter: newsletter,
          emailApplications: applications,
          emailOffers: offers,
        },
      });
      toast.success("Email settings updated");
      window.dispatchEvent(new CustomEvent("refreshUserData"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Newsletter</div>
                  <div className="text-sm text-muted-foreground">
                    Receive our monthly newsletter and product updates.
                  </div>
                </div>
                <Switch
                  checked={newsletter}
                  onCheckedChange={(v) => setNewsletter(Boolean(v))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Application Updates</div>
                  <div className="text-sm text-muted-foreground">
                    Get emails when employers view or respond to your
                    application.
                  </div>
                </div>
                <Switch
                  checked={applications}
                  onCheckedChange={(v) => setApplications(Boolean(v))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Promotional Offers</div>
                  <div className="text-sm text-muted-foreground">
                    Receive occasional promotional offers and partner content.
                  </div>
                </div>
                <Switch
                  checked={offers}
                  onCheckedChange={(v) => setOffers(Boolean(v))}
                />
              </div>

              <div className="pt-4">
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailSettings;
