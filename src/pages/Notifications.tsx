/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: any[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setNotifications(arr);
      },
      (err) => {
        console.error("Notifications listener error", err);
      }
    );

    return () => unsub();
  }, [user]);

  const markRead = async (id: string) => {
    try {
      const ref = doc(db, "notifications", id);
      await updateDoc(ref, { read: true });
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-muted-foreground">No notifications</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 border rounded-md bg-card`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{n.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.type} •{" "}
                      {n.createdAt?.toDate
                        ? n.createdAt.toDate().toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.read && (
                      <Button size="sm" onClick={() => markRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
