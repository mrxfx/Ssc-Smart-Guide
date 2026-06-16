import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "wouter";
import { Layout } from "./layout";
import { Skeleton } from "./ui/skeleton";

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // TODO: Add actual admin role check using useGetUserProfile hook
  // const { data: profile } = useGetUserProfile();
  // if (adminOnly && profile?.role !== "admin") return <Redirect to="/dashboard" />;

  return <Layout>{children}</Layout>;
}
