import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import MockTests from "@/pages/tests";
import TestInterface from "@/pages/tests/test-interface";
import TestResult from "@/pages/tests/test-result";
import QuestionBank from "@/pages/questions/index";
import QuestionDetail from "@/pages/questions/detail";
import PYQHub from "@/pages/pyq";
import Notes from "@/pages/notes";
import QuizHub from "@/pages/quiz/index";
import DailyQuiz from "@/pages/quiz/daily";
import Videos from "@/pages/videos/index";
import VideoDetail from "@/pages/videos/detail";
import AICoach from "@/pages/ai-coach";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTests from "@/pages/admin/tests";
import AdminQuestions from "@/pages/admin/questions";
import AdminNotes from "@/pages/admin/notes";
import AdminVideos from "@/pages/admin/videos";
import AdminNotifications from "@/pages/admin/notifications";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Student Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/tests">
        <ProtectedRoute><MockTests /></ProtectedRoute>
      </Route>
      {/* Exclude layout for test interface */}
      <Route path="/tests/:id" component={TestInterface} />
      <Route path="/tests/:id/result">
        <ProtectedRoute><TestResult /></ProtectedRoute>
      </Route>
      <Route path="/questions">
        <ProtectedRoute><QuestionBank /></ProtectedRoute>
      </Route>
      <Route path="/questions/:id">
        <ProtectedRoute><QuestionDetail /></ProtectedRoute>
      </Route>

      <Route path="/pyq">
        <ProtectedRoute><PYQHub /></ProtectedRoute>
      </Route>
      <Route path="/notes">
        <ProtectedRoute><Notes /></ProtectedRoute>
      </Route>
      <Route path="/quiz">
        <ProtectedRoute><QuizHub /></ProtectedRoute>
      </Route>
      <Route path="/quiz/daily">
        <ProtectedRoute><DailyQuiz /></ProtectedRoute>
      </Route>
      <Route path="/videos">
        <ProtectedRoute><Videos /></ProtectedRoute>
      </Route>
      <Route path="/videos/:id">
        <ProtectedRoute><VideoDetail /></ProtectedRoute>
      </Route>
      <Route path="/ai-coach">
        <ProtectedRoute><AICoach /></ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute><Leaderboard /></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><Profile /></ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
      </Route>
      <Route path="/admin/tests">
        <ProtectedRoute adminOnly><AdminTests /></ProtectedRoute>
      </Route>
      <Route path="/admin/questions">
        <ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>
      </Route>
      <Route path="/admin/notes">
        <ProtectedRoute adminOnly><AdminNotes /></ProtectedRoute>
      </Route>
      <Route path="/admin/videos">
        <ProtectedRoute adminOnly><AdminVideos /></ProtectedRoute>
      </Route>
      <Route path="/admin/notifications">
        <ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
