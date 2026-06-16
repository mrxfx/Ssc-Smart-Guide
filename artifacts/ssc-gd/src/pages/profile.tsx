import { useGetUserProfile, useGetUserAchievements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Star, Edit, Medal, Target } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { auth, signOut } from "@/lib/firebase";

export default function Profile() {
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();
  const { data: achievements, isLoading: isAchievementsLoading } = useGetUserAchievements();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  if (isProfileLoading) {
    return <div className="p-6 max-w-5xl mx-auto space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  // Fallback for missing auth/profile hook data
  const userProfile = profile || {
    name: "Aspirant",
    email: "student@example.com",
    avatar: null as string | null,
    role: "student",
    isPremium: false,
    rank: 0,
    studyHours: 0,
    targetExam: "SSC GD Constable 2025",
    joinedAt: new Date().toISOString()
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card className="border-t-4 border-t-primary overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={userProfile.avatar || undefined} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
                {userProfile.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  <p className="text-muted-foreground text-lg">{userProfile.email}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </Button>
                  {/* Using standard window.location to force full reload and clear contexts */}
                  <Button variant="destructive" size="sm" onClick={() => { window.location.href = "/login"; }}>
                    Sign Out
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4 pt-4">
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20">
                  <Target className="w-4 h-4 mr-2" /> {userProfile.targetExam || 'SSC GD'}
                </Badge>
                {userProfile.isPremium ? (
                  <Badge className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600">
                    <Star className="w-4 h-4 mr-2" /> Premium Member
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-3 py-1 text-sm">Free Tier</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Global Rank</p>
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> #{userProfile.rank || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Study Hours</p>
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> {userProfile.studyHours || 0}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Tests Attempted</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Joined</p>
              <p className="text-lg font-medium mt-1">
                {new Date(userProfile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" /> Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAchievementsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements?.map(ach => (
                <div key={ach.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${ach.isEarned ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/50 border-transparent opacity-50 grayscale'}`}>
                  <div className="text-4xl">{ach.icon || '🏆'}</div>
                  <div>
                    <p className="font-bold text-sm leading-tight mb-1">{ach.title}</p>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                </div>
              ))}
              {(!achievements || achievements.length === 0) && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  Complete tests and maintain streaks to earn badges!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
