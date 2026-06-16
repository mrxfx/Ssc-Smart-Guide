import { useState } from "react";
import { useListTests, useCreateTest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Lock, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AdminTests() {
  const [search, setSearch] = useState("");
  const { data: tests, isLoading, refetch } = useListTests();
  const createTest = useCreateTest();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<any>("full");
  const [duration, setDuration] = useState("60");
  const [isPremium, setIsPremium] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState("0.5");

  const filteredTests = tests?.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    try {
      await createTest.mutateAsync({
        data: {
          title,
          type,
          duration: parseInt(duration),
          negativeMarking: parseFloat(negativeMarking),
          isPremium
        }
      });
      toast({ title: "Test created successfully" });
      setIsOpen(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to create test", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Management</h1>
          <p className="text-muted-foreground">Create and manage mock tests.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Create Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., SSC GD Full Mock 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Length</SelectItem>
                      <SelectItem value="chapter">Chapter Wise</SelectItem>
                      <SelectItem value="pyq">PYQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Negative Marking</Label>
                <Input type="number" step="0.1" value={negativeMarking} onChange={e => setNegativeMarking(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="premium" checked={isPremium} onCheckedChange={(c) => setIsPremium(c as boolean)} />
                <Label htmlFor="premium" className="flex items-center gap-1 cursor-pointer">
                  Premium Test <Lock className="w-3 h-3 text-amber-500" />
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!title || createTest.isPending}>
                {createTest.isPending ? "Creating..." : "Create Test"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests?.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell><Badge variant="outline">{test.type}</Badge></TableCell>
                      <TableCell>{test.duration} mins</TableCell>
                      <TableCell>{test.totalQuestions}</TableCell>
                      <TableCell>
                        {test.isPremium ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none gap-1"><Lock className="w-3 h-3"/> Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTests?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tests found
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
