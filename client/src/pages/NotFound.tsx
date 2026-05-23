import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Decorative number */}
        <div className="relative">
          <span className="font-serif text-[8rem] font-bold text-muted/40 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-7 w-7 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let us guide you back to your wellness journey.
          </p>
        </div>

        <div className="gold-line mx-auto" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
            <Link href="/survey">
              Take Health Survey
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
