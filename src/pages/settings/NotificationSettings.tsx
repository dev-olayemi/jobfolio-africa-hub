import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const NotificationSettings = () => {
  const { user, profile } = useAuth();
  const [inApp, setInApp] = useState(false);
  const [push, setPush] = useState(false);

  useEffect(() => {
    const settings = (profile as any)?.settings || {};
    setInApp(Boolean(settings.notifyInApp));
    setPush(Boolean(settings.notifyPush));
  }, [profile]);

  const save = async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, { settings: { ...((profile as any)?.settings || {}), notifyInApp: inApp, notifyPush: push } });
      toast.success('Notification settings updated');
      window.dispatchEvent(new CustomEvent('refreshUserData'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">In-app Notifications</div>
                  <div className="text-sm text-muted-foreground">Show notifications inside the app.</div>
                </div>
                <Switch checked={inApp} onCheckedChange={(v) => setInApp(Boolean(v))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Allow push notifications on supported devices.</div>
                </div>
                <Switch checked={push} onCheckedChange={(v) => setPush(Boolean(v))} />
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

export default NotificationSettings;
