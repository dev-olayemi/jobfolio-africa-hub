import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  User,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  Building2,
  Info,
  FileText,
  Mail,
  Lock,
  Grid3x3,
  Globe,
  Plus,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// dropdown menu component removed — using a single sheet trigger instead
import { Badge } from "@/components/ui/badge";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/jobfolio-logo.jpg";

interface LayoutProps {
  children: ReactNode;
}

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Ethiopia",
  "Zambia",
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, profile } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    profile?.country || localStorage.getItem("selectedCountry") || "Nigeria"
  );

  useEffect(() => {
    // persist selection
    localStorage.setItem("selectedCountry", selectedCountry);
    window.dispatchEvent(
      new CustomEvent("countryChanged", { detail: selectedCountry })
    );
  }, [selectedCountry]);

  const handleLogout = async () => {
    await logout();
    setSheetOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const [createOpen, setCreateOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // subscribe to unread notifications count for the signed-in user
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Toolbar - Redesigned */}
      <header className="h-20 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-50 shadow-lg">
        {/* Left: Sidebar trigger + compact logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                    <img
                      src={logoImage}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold">JobFolio Africa</div>
                    <div className="text-xs text-muted-foreground">
                      Overview & management
                    </div>
                  </div>
                </div>
                {/* <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSheetOpen(false)}
                >
                </Button> */}
                {/* <ChevronDown className="h-5 w-5" /> */}
              </div>

              <div className="p-4 space-y-2">
                {user ? (
                  <>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/dashboard");
                        setSheetOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/my-posts");
                        setSheetOpen(false);
                      }}
                    >
                      My Posts
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/manage-jobs");
                        setSheetOpen(false);
                      }}
                    >
                      My Jobs
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/job-applications");
                        setSheetOpen(false);
                      }}
                    >
                      Applications
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/interactions");
                        setSheetOpen(false);
                      }}
                    >
                      Interactions
                    </Button>
                    <div className="border-t border-border/60 my-2" />
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/settings");
                        setSheetOpen(false);
                      }}
                    >
                      Settings
                    </Button>
                    <Button
                      className="w-full justify-start text-destructive"
                      variant="ghost"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/auth");
                        setSheetOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate("/auth?mode=signup");
                        setSheetOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div
            className="w-12 h-12 rounded-2xl overflow-hidden bg-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logoImage}
              alt="JobFolio"
              className="w-full h-full object-fill"
            />
          </div>
        </div>

        {/* Center: Dynamic Island - notifications, country, profile */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all">
            {/* Notifications count (left) */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary"
              aria-label="Notifications"
            >
              <Badge className="absolute -top-2 -right-3 text-[10px] leading-none">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </Badge>
              <Bell className="h-4 w-4" />
            </button>

            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-sm md:text-base font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Profile picture on the right of the island */}
            <button
              onClick={() => navigate("/profile")}
              className="ml-2 h-8 w-8 rounded-full overflow-hidden border-2 border-primary/30 shadow-sm"
              aria-label="Profile"
            >
              <img
                src={profile?.profilePictureUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Right: User Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Single menu button on right to open the sidebar sheet */}
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-primary/10"
                onClick={() => setSheetOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
                {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Toolbar - 5 tabs: Jobs, Updates, Create, Notifications, Profile */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
        <div className="h-full max-w-md mx-auto grid grid-cols-5 items-center px-2">
          {/* Jobs */}
          <button
            onClick={() => navigate("/jobs")}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive("/jobs") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs">Jobs</span>
          </button>

          {/* InBuzz */}
          <button
            onClick={() => navigate("/inbuzz")}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive("/inbuzz") || isActive("/feed") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="h-6 w-6 rounded-md flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-[10px] font-bold">
              inb
            </div>
            <span className="text-xs">InBuzz</span>
          </button>

          {/* Center Create + */}
          <div className="flex items-center justify-center -mt-6">
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="p-4 max-w-md mx-auto rounded-t-lg"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Create</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setCreateOpen(false);
                        navigate("/feed");
                      }}
                      className="justify-start"
                    >
                      Post Update
                    </Button>
                    <Button
                      onClick={() => {
                        setCreateOpen(false);
                        navigate("/post-job");
                      }}
                      variant="outline"
                      className="justify-start"
                    >
                      Post Job
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive("/notifications")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-3">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </div>
            <span className="text-xs">Alerts</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive("/profile") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
