import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Footer() {
  const { data: settings } = trpc.settings.getPublic.useQuery();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">V</span>
              </div>
              <span className="font-serif text-lg font-semibold">{settings?.siteName ?? "VitaWell Health"}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {settings?.siteTagline ?? "Your journey to optimal health starts here. Discover personalized health products tailored to your unique needs."}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Navigation</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Health Survey", href: "/survey" },
                { label: "Products", href: "/products" },
                { label: "Track Order", href: "/track-order" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                Questions about your order?
              </li>
              <li>
                <Link href="/track-order">
                  <span className="text-sm text-primary hover:underline cursor-pointer">Track your order</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings?.siteName ?? "VitaWell Health"}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Premium health products for a better life.
          </p>
        </div>
      </div>
    </footer>
  );
}
