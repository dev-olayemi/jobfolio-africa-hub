import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/10 to-background px-4">
      <div className="max-w-lg w-full bg-card border border-border rounded-lg p-8 text-center shadow">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/5 text-primary mb-4">
          <span className="text-2xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-4">
          We couldn't find the page you were looking for.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/" className="text-white bg-primary px-4 py-2 rounded-md">
            Go home
          </a>
          <a href="/" className="text-muted-foreground underline">
            Explore feed
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
