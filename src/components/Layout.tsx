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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const menuItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Build a Folio", path: "/build-folio", icon: Building2 },
  { label: "Job Listings", path: "/jobs", icon: Briefcase },
  { label: "About Us", path: "/about", icon: Info },
  { label: "Terms & Conditions", path: "/terms", icon: FileText },
  { label: "Contact Support", path: "/contact", icon: Mail },
  { label: "Privacy Policy", path: "/privacy", icon: Lock },
  { label: "Industry Category", path: "/industries", icon: Grid3x3 },
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
    const q = query(collection(db, "notifications"), where("to", "==", user.uid), where("read", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
    });
    return () => unsub();
  }, [user]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Toolbar - Redesigned */}
      <header className="h-20 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-50 shadow-lg">
        {/* Left: Ad Banner Space - BOLD & PROMINENT */}
        <div
          className="flex items-center gap-4 flex-shrink-0 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all bg-white">
            <img
              src={logoImage}
              alt="JobFolio Africa"
              className="w-full h-full object-fill"
            />
            <div className="absolute inset-0" />
          </div>
          <div className="hidden md:block">
            <div className="text-xl font-black text-foreground tracking-tight leading-tight">
              JobFolio
              <br />
              Africa
            </div>
            <div className="text-xs font-semibold text-primary">
              FIND YOUR DREAM JOB
            </div>
          </div>
        </div>

        {/* Center: Country Selector - PROMINENT */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border-2 border-primary/20 shadow-md hover:border-primary/40 transition-all">
          <Globe className="h-5 w-5 text-primary flex-shrink-0" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-transparent text-sm md:text-base font-semibold text-foreground focus:outline-none cursor-pointer min-w-[120px]"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Right: User Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Desktop User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2 h-auto py-2 px-3 hover:bg-primary/10"
                  >
                    <img
                      src={profile?.profilePictureUrl}
                      alt="avatar"
                      className="h-9 w-9 rounded-full object-cover border-2 border-primary/30"
                    />
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold">
                        {profile?.firstName} {profile?.lastName}
                      </span>
                      {profile?.badges && profile.badges.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {profile.badges[0]}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {profile?.isAdmin ||
                  profile?.email === "alice@example.com" ? (
                    <DropdownMenuItem onClick={() => navigate("/admin/jobs")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Jobs
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile User Avatar */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => navigate("/profile")}
              >
                <img
                  src={profile?.profilePictureUrl}
                  alt="avatar"
                  className="h-9 w-9 rounded-full object-cover border-2 border-primary/30"
                />
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                {/* Bottom Toolbar - 5 tabs */}
                <nav className="fixed bottom-0 left-0 right-0 h-18 bg-card border-t border-border z-50">
                  <div className="h-full max-w-md mx-auto grid grid-cols-5 items-center px-2">
                    {/* Jobs */}
                    <button
                      onClick={() => navigate("/jobs")}
                      className={`flex flex-col items-center justify-center py-2 ${isActive("/jobs") ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="text-xs">Jobs</span>
                    </button>

                    {/* Updates (feed) */}
                    <button
                      onClick={() => navigate("/feed")}
                      className={`flex flex-col items-center justify-center py-2 ${isActive("/feed") ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <div className="h-6 w-6 rounded-md flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-xs">Updates</span>
                    </button>

                    {/* Center Create + */}
                    <div className="flex items-center justify-center -mt-6">
                      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
                        <SheetTrigger asChild>
                          <Button size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl">
                            <Plus className="h-6 w-6" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="p-4 max-w-md mx-auto rounded-t-lg">
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
                      className={`flex flex-col items-center justify-center py-2 ${isActive("/notifications") ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <div className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadNotifications > 0 && (
                          <Badge className="absolute -top-2 -right-3">{unreadNotifications > 99 ? '99+' : unreadNotifications}</Badge>
                        )}
                      </div>
                      <span className="text-xs">Alerts</span>
                    </button>

                    {/* Profile */}
                    <button
                      onClick={() => navigate("/profile")}
                      className={`flex flex-col items-center justify-center py-2 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <User className="h-5 w-5" />
                      <span className="text-xs">Profile</span>
                    </button>
                  </div>
                </nav>
                    </Button>
                    {profile?.isAdmin ||
                    profile?.email === "alice@example.com" ? (
                      <Button
                        variant="ghost"
                        className="justify-start gap-3 h-auto py-2.5 px-3 text-sm"
                        onClick={() => {
                          navigate("/admin/jobs");
                          setSheetOpen(false);
                        }}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Admin Jobs</span>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-auto py-2.5 px-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-auto py-2.5 px-3 text-sm"
                    onClick={() => {
                      navigate("/auth");
                      setSheetOpen(false);
                    }}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Toolbar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
        <div className="h-full max-w-md mx-auto flex items-center justify-around px-4">
          <Button
            variant={isActive("/jobs") ? "default" : "ghost"}
            size="lg"
            onClick={() => navigate("/jobs")}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs">Jobs</span>
          </Button>

          {/* Center: Updates + Create */}
          <div className="flex flex-col items-center">
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  onClick={() => {
                    /* opens sheet via trigger */
                  }}
                  className={`h-12 w-12 rounded-full shadow-md ${
                    isActive("/feed")
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-foreground"
                  }`}
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

            <button
              onClick={() => navigate("/feed")}
              className={`text-xs mt-1 ${
                isActive("/feed")
                  ? "text-primary font-semibold"
                  : "text-xs text-muted-foreground"
              }`}
            >
              Updates
            </button>
          </div>

          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            size="lg"
            onClick={() => navigate("/profile")}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};
