import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, User, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  { label: "Home", path: "/" },
  { label: "Build a Folio", path: "/build-folio" },
  { label: "Job Listings", path: "/jobs" },
  { label: "About Us", path: "/about" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Contact Support", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Industry Category", path: "/industries" },
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
    window.dispatchEvent(new CustomEvent("countryChanged", { detail: selectedCountry }));
  }, [selectedCountry]);

  const handleLogout = async () => {
    await logout();
    setSheetOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="JobFolio" className="h-10 rounded-md" />
          <div>
            <div className="text-lg font-bold">JobFolio Africa</div>
            <div className="text-xs text-muted-foreground">Find jobs in your country</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Country selector prominent */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-md border border-input px-2 py-1 bg-card"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search placeholder */}
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search jobs, companies..."
              className="px-3 py-2 rounded-md border border-input w-72 bg-card"
            />
          </div>

          {/* Right actions */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-card">
            <div className="flex flex-col gap-2 mt-8">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    navigate(item.path);
                    setSheetOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {user ? (
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    navigate("/auth");
                    setSheetOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* User summary on desktop */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <img
                  src={profile?.profilePictureUrl}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {profile?.firstName} {profile?.lastName}
                  </span>
                  <div className="flex gap-1">
                    {(profile?.badges || []).slice(0, 3).map((b) => (
                      <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              {/* Simple admin link — extend with real admin checks later */}
              {profile?.isAdmin || profile?.email === "alice@example.com" ? (
                <DropdownMenuItem onClick={() => navigate("/admin/jobs")}>
                  Admin Jobs
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden sm:flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button onClick={() => navigate("/auth")}>Sign Up</Button>
          </div>
        )}
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
