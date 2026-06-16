import { Link } from "wouter";
import { useGetDailyQuiz } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Trophy } from "lucide-react";

export default function QuizHub() {
  const { data: quiz, isLoading } = useGetDailyQuiz();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Quiz Hub</h1>
          <p className="text-muted-foreground">Short daily quizzes to keep your streak alive.</p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : quiz ? (
        <Card className="border-t-4 border-t-primary overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Flame className="w-32 h-32 text-orange-500" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-bold rounded-full flex items-center gap-1 dark:bg-orange-900/30 dark:text-orange-400">
                <Flame className="w-4 h-4" /> Today's Challenge
              </span>
            </div>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium">{quiz.questions.length} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Maintain your streak</span>
              </div>
            </div>

            {quiz.isCompleted ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-green-800 dark:text-green-400">Completed!</h3>
                  <p className="text-sm text-green-600 dark:text-green-500">You scored {quiz.userScore} marks.</p>
                </div>
                <Link href="/quiz/daily">
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30">Review Answers</Button>
                </Link>
              </div>
            ) : (
              <Link href="/quiz/daily">
                <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90">
                  Start Daily Quiz
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          No daily quiz available today. Check back tomorrow!
        </div>
      )}
    </div>
  );
}
