import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { BookOpen, CheckSquare, Home, LayoutDashboard, Settings, Video, Trophy, BookMarked, User as UserIcon, BrainCircuit } from "lucide-react";
import { Button } from "./ui/button";

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tests", label: "Mock Tests", icon: CheckSquare },
  { href: "/questions", label: "Q-Bank", icon: BookOpen },
  { href: "/pyq", label: "PYQs", icon: BookMarked },
  { href: "/notes", label: "Study Notes", icon: BookOpen },
  { href: "/quiz", label: "Daily Quiz", icon: CheckSquare },
  { href: "/videos", label: "Video Lessons", icon: Video },
  { href: "/ai-coach", label: "AI Coach", icon: BrainCircuit },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const adminNav = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserIcon },
  { href: "/admin/tests", label: "Tests", icon: CheckSquare },
  { href: "/admin/questions", label: "Questions", icon: BookOpen },
  { href: "/admin/notes", label: "Notes", icon: BookOpen },
  { href: "/admin/videos", label: "Videos", icon: Video },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Very basic mock check for admin, in reality checking user claims or role
  const isAdmin = location.startsWith("/admin");

  const navLinks = isAdmin ? adminNav : studentNav;

  return (
    <div className="min-h-screen flex bg-background">
      {user && (
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="font-bold text-lg text-primary">
              Smart Coach
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <ThemeToggle />
          </div>
        </aside>
      )}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
