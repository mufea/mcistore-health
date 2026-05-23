import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Brain,
  Calendar,
  ClipboardList,
  Home,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/mufea21", label: "Overview", icon: BarChart3 },
  { href: "/mufea21/survey", label: "Survey Manager", icon: ClipboardList },
  { href: "/mufea21/products", label: "Products", icon: Package },
  { href: "/mufea21/orders", label: "Orders", icon: ShoppingBag },
  { href: "/mufea21/knowledge", label: "Knowledge Base", icon: Brain },
  { href: "/mufea21/meetings", label: "Meetings", icon: Calendar },
  { href: "/mufea21/chatbot", label: "Conversations", icon: MessageCircle },
  { href: "/mufea21/settings", label: "Settings", icon: Settings },
  { href: "/mufea21/users", label: "Users", icon: Users },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const [location] = useLocation();

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border/60 flex flex-col min-h-screen">
      <div className="p-5 border-b border-border/60">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground text-xs font-bold tracking-tight">MC</span>
            </div>
            <div>
              <span className="font-bold text-sm text-foreground tracking-tight">MCI Store</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // Match both /mufea21/x and /admin/x
          const isActive =
            location === item.href ||
            location === item.href.replace("/mufea21", "/admin");
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60 space-y-0.5">
        <Link href="/">
          <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Home className="h-4 w-4 flex-shrink-0" /> Back to Website
          </a>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" /> Log Out
        </button>
      </div>
    </aside>
  );
}
