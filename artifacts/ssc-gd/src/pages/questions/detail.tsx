import { useParams, Link } from "wouter";
import { useGetQuestion } from "@workspace/api-client-react";
import { getGetQuestionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, BrainCircuit, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function QuestionDetail() {
  const { id } = useParams();
  const { data: question, isLoading } = useGetQuestion(id!, { query: { enabled: !!id, queryKey: getGetQuestionQueryKey(id!) } });
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  if (isLoading || !question) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const isCorrect = selectedOption === question.correctOption;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/questions">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Question Details</h1>
        </div>
        <Button variant="outline" size="icon" className={question.isBookmarked ? "text-primary" : "text-muted-foreground"}>
          <Bookmark className="h-5 w-5" fill={question.isBookmarked ? "currentColor" : "none"} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{question.subject}</Badge>
            <Badge variant="outline">{question.topic || 'General'}</Badge>
            <Badge variant="secondary" className={
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }>{question.difficulty}</Badge>
            {question.isPYQ && <Badge className="bg-primary">PYQ {question.year}</Badge>}
          </div>
          <CardTitle className="text-xl leading-relaxed">{question.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} disabled={showSolution} className="space-y-3">
            {question.options.map((option, idx) => {
              let itemClass = "flex items-center space-x-3 p-4 border rounded-lg transition-colors ";
              
              if (showSolution) {
                if (option.id === question.correctOption) {
                  itemClass += "bg-green-50 border-green-500 dark:bg-green-900/20";
                } else if (option.id === selectedOption && !isCorrect) {
                  itemClass += "bg-red-50 border-red-500 dark:bg-red-900/20";
                } else {
                  itemClass += "opacity-50";
                }
              } else {
                itemClass += "hover:bg-muted/50 cursor-pointer";
              }

              return (
                <div key={option.id} className={itemClass} onClick={() => !showSolution && setSelectedOption(option.id)}>
                  <RadioGroupItem value={option.id} id={option.id} disabled={showSolution} />
                  <Label htmlFor={option.id} className={`flex-1 text-base ${!showSolution && "cursor-pointer"}`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option.text}
                  </Label>
                  {showSolution && option.id === question.correctOption && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {showSolution && option.id === selectedOption && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              );
            })}
          </RadioGroup>

          {!showSolution ? (
            <Button 
              className="w-full" 
              onClick={() => setShowSolution(true)} 
              disabled={!selectedOption}
            >
              Check Answer
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  Explanation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
              
              <Button variant="outline" className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/5">
                <BrainCircuit className="h-4 w-4" />
                Ask AI Coach to explain this differently
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
