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
  Home,
  Users,
  MessageSquare,
  Bookmark,
  TrendingUp,
  Search,
  Heart,
  Send,
  BarChart3,
  UserCheck,
  Calendar,
  MapPin,
  Star,
  Filter,
  Eye,
  Share2,
  Zap,
  Target,
  Award,
  Layers,
  Activity,
  PieChart,
  Compass,
  Rss,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Home,
      description: "Overview & analytics",
      color: "text-blue-500",
    },
    {
      label: "Feed",
      path: "/feed",
      icon: Rss,
      description: "Latest updates & posts",
      color: "text-green-500",
    },
    {
      label: "Jobs",
      path: "/jobs",
      icon: Briefcase,
      description: "Browse opportunities",
      color: "text-purple-500",
    },
    {
      label: "My Posts",
      path: "/my-posts",
      icon: FileText,
      description: "Your content & updates",
      color: "text-orange-500",
    },
    {
      label: "Applications",
      path: "/job-applications",
      icon: Send,
      description: "Track your applications",
      color: "text-cyan-500",
    },
    {
      label: "Interactions",
      path: "/interactions",
      icon: Heart,
      description: "Likes, comments & shares",
      color: "text-pink-500",
    },
    {
      label: "Connections",
      path: "/connections",
      icon: Users,
      description: "Your network",
      color: "text-indigo-500",
    },
    {
      label: "Saved",
      path: "/saved",
      icon: Bookmark,
      description: "Bookmarked content",
      color: "text-yellow-500",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      description: "Performance insights",
      color: "text-emerald-500",
    },
  ];

  const settingsItems = [
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      description: "Account preferences",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
      description: "Edit your profile",
    },
    {
      label: "Privacy",
      path: "/privacy",
      icon: Lock,
      description: "Privacy controls",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Modern Header */}
      <header
        className="h-16 border-b border-slate-200/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-50"
        style={{ backdropFilter: "blur(10px) saturate(120%)" }}
      >
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl border border-slate-200/60 duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 border-r border-slate-200/60">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-slate-200/60">
                    <img
                      src={logoImage}
                      alt="JobFolio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-lg">JobFolio Africa</div>
                    <div className="text-sm text-slate-600">
                      {profile?.firstName || "Welcome"} • {profile?.accountType || "User"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  Navigation
                </div>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start h-12 px-3 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 text-slate-700 hover:text-slate-900"
                      }`}
                      onClick={() => {
                        navigate(item.path);
                        setSheetOpen(false);
                      }}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${active ? "text-primary" : item.color}`} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Button>
                  );
                })}

                <div className="border-t border-slate-200/60 my-4" />

                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  Account
                </div>
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start h-12 px-3 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 text-slate-700 hover:text-slate-900"
                      }`}
                      onClick={() => {
                        navigate(item.path);
                        setSheetOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5 mr-3 text-slate-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Button>
                  );
                })}

                <div className="border-t border-slate-200/60 my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-3 rounded-xl text-red-600 hover:bg-red-50/80 hover:text-red-700 border border-transparent hover:border-red-200/60 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-500">End your session</div>
                  </div>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200/60">
              <img
                src={logoImage}
                alt="JobFolio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-lg">JobFolio</div>
              <div className="text-xs text-slate-600 -mt-1">Africa Hub</div>
            </div>
          </div>
        </div>

        {/* Center: Search & Country */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-all duration-200">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search jobs, people, posts..."
              className="bg-transparent text-sm placeholder:text-slate-500 focus:outline-none w-64"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <Globe className="h-4 w-4 text-slate-500" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 relative transition-all duration-200"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Button> */}

          <Button
            variant="ghost"
            className="h-10 px-3 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            onClick={() => navigate("/profile")}
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-accent mr-2">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {profile?.firstName?.[0] || "U"}
                </div>
              )}
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {profile?.firstName || "Profile"}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Modern Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-t border-slate-200/50 z-50"
        style={{ backdropFilter: "blur(10px) saturate(120%)" }}
      >
        <div className="h-full max-w-md mx-auto grid grid-cols-5 items-center px-2">
          <button
            onClick={() => navigate("/jobs")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
              isActive("/jobs")
                ? "text-primary bg-primary/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Jobs</span>
          </button>

          <button
            onClick={() => navigate("/feed")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
              isActive("/feed")
                ? "text-primary bg-primary/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Rss className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Feed</span>
          </button>

          {/* Center Create Button */}
          <div className="flex items-center justify-center -mt-6">
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-200 border-4 border-white"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="p-6 max-w-md mx-auto rounded-t-2xl border-t border-slate-200/60"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Create Something</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setCreateOpen(false);
                        navigate("/feed?create=post");
                      }}
                      className="h-16 flex-col gap-2 rounded-xl"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">Post</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setCreateOpen(false);
                        navigate("/post-job");
                      }}
                      variant="outline"
                      className="h-16 flex-col gap-2 rounded-xl border-slate-200/60"
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="text-sm">Job</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <button
            onClick={() => navigate("/notifications")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative ${
              isActive("/notifications")
                ? "text-primary bg-primary/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Alerts</span>
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center bg-red-500">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </button>

          <button
            onClick={() => navigate("/profile")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
              isActive("/profile")
                ? "text-primary bg-primary/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
