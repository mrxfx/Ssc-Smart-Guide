import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTest } from "@workspace/api-client-react";
import { getGetTestQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Flag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function TestInterface() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: test, isLoading } = useGetTest(id!, { query: { enabled: !!id, queryKey: getGetTestQueryKey(id!) } });
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (test) {
      setTimeLeft(test.duration * 60);
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft <= 0 && test) {
      // Auto submit when time is up
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  if (isLoading || !test) {
    return <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
      <Skeleton className="h-12 w-full max-w-4xl" />
      <Skeleton className="h-96 w-full max-w-4xl" />
    </div>;
  }

  const currentQuestion = test.questions[currentQuestionIdx];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const toggleReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const clearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    // In a real app, call submit API
    // const formattedAnswers = Object.entries(answers).map(([qId, optionId]) => ({ questionId: qId, selectedOption: optionId }));
    // await submitTest.mutateAsync({ testId: id!, data: { answers: formattedAnswers, timeTaken: test.duration * 60 - timeLeft }});
    setLocation(`/tests/${id}/result`);
  };

  const getQuestionStatus = (qId: string) => {
    if (markedForReview.has(qId) && answers[qId]) return "answered-marked";
    if (markedForReview.has(qId)) return "marked";
    if (answers[qId]) return "answered";
    return "unvisited"; // Simplified
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-500 text-white border-green-600";
      case "marked": return "bg-purple-500 text-white border-purple-600";
      case "answered-marked": return "bg-purple-500 text-white border-purple-600 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full";
      default: return "bg-card text-foreground border-border hover:bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-lg truncate max-w-[50%]">{test.title}</h1>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-muted'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Submit Test</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {Object.keys(answers).length} out of {test.questions.length} questions.
                  Are you sure you want to submit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Yes, Submit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Question {currentQuestionIdx + 1} of {test.questions.length}</h2>
            <div className="flex gap-2 text-sm text-muted-foreground">
              {currentQuestion.subject && <span className="px-2 py-1 bg-muted rounded">{currentQuestion.subject}</span>}
              <span className="px-2 py-1 bg-muted rounded">+{currentQuestion.marks} | -{test.negativeMarking}</span>
            </div>
          </div>

          <Card className="flex-1 mb-6 border-2">
            <div className="p-6">
              <p className="text-lg mb-8 leading-relaxed">{currentQuestion.text}</p>
              
              <RadioGroup value={answers[currentQuestion.id] || ""} onValueChange={handleAnswer} className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div key={option.id} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleAnswer(option.id)}>
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base leading-relaxed">
                      <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
            <div className="flex gap-2">
              <Button variant="outline" onClick={toggleReview} className="gap-2">
                <Flag className="w-4 h-4" />
                {markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"}
              </Button>
              <Button variant="outline" onClick={clearResponse}>Clear</Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button 
                onClick={() => setCurrentQuestionIdx(prev => Math.min(test.questions.length - 1, prev + 1))}
                disabled={currentQuestionIdx === test.questions.length - 1}
                className="gap-2"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>

        {/* Sidebar Palette */}
        <aside className="w-80 border-l border-border bg-card hidden lg:flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold mb-4">Question Palette</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-card border border-border"></div> Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-500"></div> Marked</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-500 relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-1.5 after:h-1.5 after:bg-green-500 after:rounded-full"></div> Answered & Marked</div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-10 h-10 rounded border font-medium flex items-center justify-center relative transition-transform hover:scale-105
                    ${getStatusColor(getQuestionStatus(q.id))}
                    ${currentQuestionIdx === idx ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
