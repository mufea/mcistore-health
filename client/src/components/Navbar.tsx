import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl, getPasswordResetUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCallback, useState } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const siteName = settings?.siteName ?? "MCI Store";

  const handleLogout = useCallback(async () => {
    setMobileOpen(false);
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Health Survey", href: "/survey" },
    { label: "Products", href: "/products" },
    ...(isAuthenticated ? [{ label: "My Orders", href: "/my-orders" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold tracking-tight">MC</span>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </div>
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* ── Desktop auth ──────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
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
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
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
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Sign In
                </Button>
              </div>
              <button
                type="button"
                onClick={() => (window.location.href = getPasswordResetUrl())}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile: avatar (if signed in) + hamburger ─────────────────── */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0 flex flex-col">
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px] font-bold">MC</span>
                  </div>
                  <span className="font-serif text-base font-semibold text-foreground">{siteName}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeMobile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User info (if signed in) */}
              {isAuthenticated && (
                <div className="px-5 py-4 border-b border-border/40 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMobile}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        location === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60 hover:text-primary"
                      }`}
                    >
                      {link.href === "/" && <Home className="h-4 w-4 flex-shrink-0" />}
                      {link.href === "/survey" && <Stethoscope className="h-4 w-4 flex-shrink-0" />}
                      {link.href === "/products" && <Package className="h-4 w-4 flex-shrink-0" />}
                      {link.href === "/my-orders" && <ShoppingBag className="h-4 w-4 flex-shrink-0" />}
                      {link.label}
                    </div>
                  </Link>
                ))}

                {/* Authenticated extra links */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-border/40 my-2" />
                    <Link href="/profile" onClick={closeMobile}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${location === "/profile" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60 hover:text-primary"}`}>
                        <User className="h-4 w-4 flex-shrink-0" />
                        My Profile
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link href="/mufea21" onClick={closeMobile}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${location.startsWith("/mufea21") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60 hover:text-primary"}`}>
                          <Settings className="h-4 w-4 flex-shrink-0" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}

                  </>
                )}
              </nav>

              {/* Bottom auth actions */}
              <div className="px-4 py-4 border-t border-border/60 space-y-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => { closeMobile(); window.location.href = getLoginUrl(); }}
                    >
                      Sign In
                    </Button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => { closeMobile(); window.location.href = getPasswordResetUrl(); }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
