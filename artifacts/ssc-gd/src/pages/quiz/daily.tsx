import { useState } from "react";
import { useLocation } from "wouter";
import { useGetDailyQuiz } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailyQuiz() {
  const { data: quiz, isLoading } = useGetDailyQuiz();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (isLoading || !quiz) {
    return <div className="p-6 max-w-3xl mx-auto"><Skeleton className="h-96 w-full" /></div>;
  }

  // If completed, just redirect back or show a review UI (simplified here to redirect)
  if (quiz.isCompleted && Object.keys(answers).length === 0) {
     return <div className="p-6 max-w-3xl mx-auto text-center py-20">
       <h2 className="text-2xl font-bold mb-4">Quiz Already Completed</h2>
       <Button onClick={() => setLocation('/quiz')}>Go Back</Button>
     </div>;
  }

  const currentQuestion = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.questions.length - 1;

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({ title: "Please select an answer", variant: "destructive" });
      return;
    }
    if (isLast) {
      // Submit
      toast({ title: "Quiz submitted successfully!", description: "Streak updated." });
      setLocation('/quiz');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Daily Quiz</h1>
          <span className="font-medium text-muted-foreground">{currentIdx + 1} / {quiz.questions.length}</span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}></div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-2">
        <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
          <p className="text-xl font-medium mb-8 leading-relaxed">{currentQuestion.text}</p>
          
          <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))} 
            className="space-y-4 mb-8"
          >
            {currentQuestion.options.map((option, idx) => (
              <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.id }))}>
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-lg">
                  <span className="font-bold mr-3 text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-auto flex justify-end">
            <Button size="lg" onClick={handleNext} className="px-8 text-lg gap-2" disabled={!answers[currentQuestion.id]}>
              {isLast ? "Submit Quiz" : "Next Question"} <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
