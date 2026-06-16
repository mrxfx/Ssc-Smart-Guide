import { useState } from "react";
import { useListVideos, useCreateVideo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AdminVideos() {
  const { data: videos, isLoading, refetch } = useListVideos();
  const createVideo = useCreateVideo();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Maths");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("30");
  const [instructor, setInstructor] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const handleCreate = async () => {
    try {
      await createVideo.mutateAsync({
        data: {
          title,
          subject,
          videoUrl,
          thumbnailUrl,
          duration: parseInt(duration) * 60, // convert mins to seconds
          instructor,
          isPremium
        }
      });
      toast({ title: "Video added successfully" });
      setIsOpen(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to add video", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Lessons</h1>
          <p className="text-muted-foreground">Manage expert video content.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Video</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reasoning">Reasoning</SelectItem>
                      <SelectItem value="GK">General Knowledge</SelectItem>
                      <SelectItem value="Maths">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Input value={instructor} onChange={e => setInstructor(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Video Embed URL</Label>
                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="premium-video" checked={isPremium} onCheckedChange={(c) => setIsPremium(c as boolean)} />
                <Label htmlFor="premium-video" className="cursor-pointer">Premium Video</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!title || !videoUrl || createVideo.isPending}>
                {createVideo.isPending ? "Adding..." : "Add Video"}
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
                  <TableHead>Video</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos?.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium flex items-center gap-4">
                      <div className="w-16 h-10 bg-muted rounded overflow-hidden relative flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="line-clamp-1">{video.title}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">{video.subject}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{video.instructor}</TableCell>
                    <TableCell>{Math.floor(video.duration / 60)} mins</TableCell>
                    <TableCell>
                      {video.isPremium ? <Badge className="bg-amber-100 text-amber-800 border-none">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {videos?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No videos found
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
