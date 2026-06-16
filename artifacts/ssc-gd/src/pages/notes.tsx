import { useState } from "react";
import { useListNotes } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download, Lock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Notes() {
  const [subject, setSubject] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: notes, isLoading } = useListNotes({
    ...(subject !== "all" && { subject }),
    ...(search && { search })
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Study Notes</h1>
          <p className="text-muted-foreground">High-quality PDF notes and study material.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes or chapters..."
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes?.map((note) => (
            <Card key={note.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{note.chapter}</p>
                  </div>
                  {note.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none">
                      <Lock className="w-3 h-3 mr-1" /> Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Badge variant="outline" className="mb-2">{note.subject}</Badge>
                {note.description && <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> PDF</span>
                  {note.fileSize && <span>{note.fileSize}</span>}
                  <span>{note.downloadCount} downloads</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2" variant={note.isPremium ? "secondary" : "default"} onClick={() => window.open(note.fileUrl, '_blank')}>
                  {note.isPremium ? <><Lock className="w-4 h-4" /> Unlock Premium</> : <><Download className="w-4 h-4" /> Download Note</>}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {notes?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No notes found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
