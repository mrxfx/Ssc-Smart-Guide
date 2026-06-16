import { useState } from "react";
import { useListQuestions, useCreateQuestion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminQuestions() {
  const [subject, setSubject] = useState<string>("all");
  const { data: paginatedQuestions, isLoading, refetch } = useListQuestions({
    ...(subject !== "all" && { subject })
  });
  const createQuestion = useCreateQuestion();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Form
  const [text, setText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [qSubject, setQSubject] = useState("Reasoning");
  const [difficulty, setDifficulty] = useState<any>("medium");

  const handleCreate = async () => {
    try {
      await createQuestion.mutateAsync({
        data: {
          text,
          options: [
            { id: "A", text: optA },
            { id: "B", text: optB },
            { id: "C", text: optC },
            { id: "D", text: optD },
          ],
          correctOption,
          explanation,
          subject: qSubject,
          difficulty
        }
      });
      toast({ title: "Question added successfully" });
      setIsOpen(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to add question", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Manage questions across all subjects.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Question</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={qSubject} onValueChange={setQSubject}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reasoning">Reasoning</SelectItem>
                        <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                        <SelectItem value="Elementary Mathematics">Elementary Maths</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea value={text} onChange={e => setText(e.target.value)} rows={3} />
                </div>
                <div className="space-y-3">
                  <Label>Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} />
                    <Input placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} />
                    <Input placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} />
                    <Input placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Correct Option</Label>
                  <Select value={correctOption} onValueChange={setCorrectOption}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      <SelectItem value="C">Option C</SelectItem>
                      <SelectItem value="D">Option D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!text || !optA || !optB || createQuestion.isPending}>
                {createQuestion.isPending ? "Adding..." : "Add Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Reasoning">Reasoning</SelectItem>
                <SelectItem value="GK">General Knowledge</SelectItem>
                <SelectItem value="Maths">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuestions?.questions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">
                        <p className="line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline">{q.subject}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-none' : 
                          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border-none' : 
                          'bg-red-100 text-red-800 border-none'
                        }>{q.difficulty}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedQuestions?.questions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No questions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
