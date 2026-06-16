import { useState } from "react";
import { Link } from "wouter";
import { useListVideos } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Eye, Lock, PlayCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Videos() {
  const [subject, setSubject] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: videos, isLoading } = useListVideos({
    ...(subject !== "all" && { subject }),
    ...(search && { search })
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Lessons</h1>
          <p className="text-muted-foreground">Expert lectures for concept clarity.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos or instructors..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos?.map((video) => (
            <Card key={video.id} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
              <div className="relative aspect-video bg-muted group">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <PlayCircle className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded font-medium">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
                {video.isPremium && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded shadow flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Premium
                  </div>
                )}
              </div>
              
              {video.progress !== undefined && video.progress !== null && video.progress > 0 && (
                <Progress value={video.progress} className="h-1 rounded-none" />
              )}
              
              <CardHeader className="p-4 pb-2">
                <Badge variant="outline" className="w-fit mb-2">{video.subject}</Badge>
                <CardTitle className="line-clamp-2 text-lg leading-tight">{video.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">{video.instructor || 'Smart Coach'}</span>
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/videos/${video.id}`} className="w-full">
                  <Button className="w-full gap-2" variant={video.isPremium ? "secondary" : "default"}>
                    {video.isPremium ? <><Lock className="w-4 h-4" /> Unlock</> : <><PlayCircle className="w-4 h-4" /> Watch Now</>}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {videos?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No videos found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
