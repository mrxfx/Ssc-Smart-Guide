import { useState } from "react";
import { useListNotes, useCreateNote } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AdminNotes() {
  const { data: notes, isLoading, refetch } = useListNotes();
  const createNote = useCreateNote();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Reasoning");
  const [chapter, setChapter] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const handleCreate = async () => {
    try {
      await createNote.mutateAsync({
        data: {
          title,
          subject,
          chapter,
          fileUrl,
          isPremium
        }
      });
      toast({ title: "Note uploaded successfully" });
      setIsOpen(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to upload note", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Study Notes</h1>
          <p className="text-muted-foreground">Manage PDF notes and study materials.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Upload Note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Coding Decoding Basics" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
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
                  <Label>Chapter</Label>
                  <Input value={chapter} onChange={e => setChapter(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>File URL (PDF)</Label>
                <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." type="url" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="premium-note" checked={isPremium} onCheckedChange={(c) => setIsPremium(c as boolean)} />
                <Label htmlFor="premium-note" className="cursor-pointer">Premium Note</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!title || !fileUrl || createNote.isPending}>
                {createNote.isPending ? "Uploading..." : "Upload Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Subject / Chapter</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes?.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded">
                        <FileText className="w-5 h-5" />
                      </div>
                      {note.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">{note.subject}</Badge>
                        <span className="text-xs text-muted-foreground">{note.chapter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {note.isPremium ? <Badge className="bg-amber-100 text-amber-800 border-none">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {notes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No notes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
