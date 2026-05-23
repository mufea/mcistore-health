import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, LogOut, Package, Settings, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCallback } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  const { data: settings } = trpc.settings.getPublic.useQuery();

  const isAdmin = user?.role === "admin";

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold tracking-tight">MC</span>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {settings?.siteName ?? "MCI Store"}
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">
            <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
              Home
            </span>
          </Link>
          <Link href="/survey">
            <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === "/survey" ? "text-primary" : "text-muted-foreground"}`}>
              Health Survey
            </span>
          </Link>
          <Link href="/products">
            <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === "/products" ? "text-primary" : "text-muted-foreground"}`}>
              Products
            </span>
          </Link>
          {isAuthenticated && (
            <Link href="/my-orders">
              <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === "/my-orders" ? "text-primary" : "text-muted-foreground"}`}>
                My Orders
              </span>
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/mufea21">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
