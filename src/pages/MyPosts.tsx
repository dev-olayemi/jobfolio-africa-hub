import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Posts</h1>
          <Button onClick={() => window.location.assign("/feed")}>
            New Post
          </Button>
        </div>

        <div className="space-y-3">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                You haven't posted any updates yet.
              </CardContent>
            </Card>
          ) : (
            posts.map((p) => (
              <Card key={p.id} className="hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {p.title || "Untitled"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {p.excerpt || p.body?.slice?.(0, 140) || "—"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.createdAt?.toDate
                        ? new Date(p.createdAt.toDate()).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyPosts;
