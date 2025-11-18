import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Toolbar - Redesigned */}
      <header className="h-20 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-50 shadow-lg">
        {/* Left: Ad Banner Space - BOLD & PROMINENT */}
        <div
          className="flex items-center gap-4 flex-shrink-0 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-primary/80 shadow-2xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all bg-gradient-to-br from-primary to-accent ring-2 ring-primary/20">
            <img
              src={logoImage}
              alt="JobFolio Africa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
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
                className="font-semibold"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Menu Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 bg-gradient-to-b from-card via-card to-card/50 p-0 border-l border-border"
            >
              {/* Sidebar Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-4 py-4 backdrop-blur-sm">
                <h2 className="font-bold text-lg text-foreground">Menu</h2>
                <p className="text-xs text-muted-foreground">
                  Navigation & Settings
                </p>
              </div>

              {/* Sidebar Content */}
              <div className="flex flex-col gap-1 mt-4 px-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="justify-start gap-3 h-auto py-2.5 px-3 text-sm group"
                      onClick={() => {
                        navigate(item.path);
                        setSheetOpen(false);
                      }}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}

                {/* Divider */}
                <div className="my-3 border-t border-border" />

                {/* User Section */}
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-auto py-2.5 px-3 text-sm"
                      onClick={() => {
                        navigate("/profile");
                        setSheetOpen(false);
                      }}
                    >
                      <img
                        src={profile?.profilePictureUrl}
                        alt="avatar"
                        className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                      />
                      <span>Profile</span>
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

          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="lg"
            onClick={() => navigate("/")}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>

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
