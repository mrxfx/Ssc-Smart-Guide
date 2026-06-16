import { useState } from "react";
import { Link } from "wouter";
import { useListTests } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, HelpCircle, Lock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MockTests() {
  const [type, setType] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: tests, isLoading } = useListTests({
    ...(type !== "all" && { type: type as any }),
    ...(subject !== "all" && { subject })
  });

  const filteredTests = tests?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Mock Tests</h1>
          <p className="text-muted-foreground">Practice with full-length and chapter-wise tests.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Test Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full Length</SelectItem>
            <SelectItem value="chapter">Chapter Wise</SelectItem>
            <SelectItem value="pyq">Previous Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="General Intelligence">General Intelligence</SelectItem>
            <SelectItem value="General Knowledge">General Knowledge</SelectItem>
            <SelectItem value="Elementary Mathematics">Elementary Maths</SelectItem>
            <SelectItem value="English">English/Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests?.map((test) => (
            <Card key={test.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{test.title}</CardTitle>
                    {test.subject && <p className="text-sm text-muted-foreground">{test.subject}</p>}
                  </div>
                  {test.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none dark:bg-amber-900/30 dark:text-amber-400">
                      <Lock className="w-3 h-3 mr-1" /> Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{test.totalQuestions} Qs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration} mins</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{test.type}</Badge>
                  <Badge variant="outline">{test.maxMarks} Marks</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/tests/${test.id}`} className="w-full">
                  <Button className="w-full" variant={test.isPremium ? "secondary" : "default"}>
                    {test.isPremium ? "Unlock Premium" : "Start Test"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {filteredTests?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No tests found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
