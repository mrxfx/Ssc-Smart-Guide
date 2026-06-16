import { useState } from "react";
import { Link } from "wouter";
import { useListQuestions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function QuestionBank() {
  const [subject, setSubject] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: paginatedQuestions, isLoading } = useListQuestions({
    ...(subject !== "all" && { subject }),
    ...(difficulty !== "all" && { difficulty: difficulty as any })
  });

  const questions = paginatedQuestions?.questions || [];

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(search.toLowerCase()) || 
    (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Practice from our vast collection of questions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions or topics..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Reasoning">Reasoning</SelectItem>
            <SelectItem value="GK">General Knowledge</SelectItem>
            <SelectItem value="Maths">Mathematics</SelectItem>
            <SelectItem value="English">English</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{q.subject}</Badge>
                    <Badge variant="secondary" className={
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30'
                    }>{q.difficulty}</Badge>
                    {q.isPYQ && <Badge variant="default" className="bg-primary">PYQ {q.year}</Badge>}
                  </div>
                  <CardTitle className="text-lg leading-relaxed">{q.text}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className={q.isBookmarked ? "text-primary" : "text-muted-foreground"}>
                  <Bookmark className="h-5 w-5" fill={q.isBookmarked ? "currentColor" : "none"} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">{q.topic || 'General'}</span>
                  <Link href={`/questions/${q.id}`}>
                    <Button variant="outline" size="sm">View Solution</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No questions found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
