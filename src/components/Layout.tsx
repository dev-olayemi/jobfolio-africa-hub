import { ReactNode } from "react";
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
        {/* Left: Ad Banner Placeholder */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
        </div>

        {/* Center: Country Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <img src={logoImage} alt="JobFolio" className="h-6" />
              <span className="font-semibold text-foreground">JobFolio</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 bg-popover z-50">
            {countries.map((country) => (
              <DropdownMenuItem key={country} className="cursor-pointer">
                {country}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Burger Menu */}
        <Sheet>
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
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
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
