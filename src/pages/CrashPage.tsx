import { Button } from "@/components/ui/button";

const CrashPage = ({ error }: { error?: Error | null }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="max-w-xl w-full bg-white border border-border rounded-lg p-6 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-destructive mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          We encountered an unexpected error. Try refreshing the page or come
          back later.
        </p>
        {error && (
          <details className="text-xs text-muted-foreground mb-4 whitespace-pre-wrap text-left bg-muted/5 p-3 rounded">
            {String(error.message)}
          </details>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrashPage;
