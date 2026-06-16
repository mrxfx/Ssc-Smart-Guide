import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">SSC GD Smart Coach</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Crack SSC GD with <span className="text-primary">Confidence</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The most comprehensive, AI-powered exam preparation platform for Indian government job aspirants.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">Start Free Trial</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">Sign In</Button>
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-border rounded-xl bg-card">
            <h3 className="text-2xl font-bold mb-2">10k+</h3>
            <p className="text-muted-foreground">Active Students</p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <h3 className="text-2xl font-bold mb-2">500+</h3>
            <p className="text-muted-foreground">Mock Tests</p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <h3 className="text-2xl font-bold mb-2">92%</h3>
            <p className="text-muted-foreground">Success Rate</p>
          </div>
        </div>
      </main>
    </div>
  );
}
