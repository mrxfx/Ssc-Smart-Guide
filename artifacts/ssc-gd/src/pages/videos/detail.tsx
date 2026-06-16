import { useParams, Link } from "wouter";
import { useGetVideo } from "@workspace/api-client-react";
import { getGetVideoQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PlayCircle, Clock, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VideoDetail() {
  const { id } = useParams();
  const { data: video, isLoading } = useGetVideo(id!, { query: { enabled: !!id, queryKey: getGetVideoQueryKey(id!) } });

  if (isLoading || !video) {
    return <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-[60vh] w-full rounded-xl" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/videos">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <Badge variant="outline">{video.subject}</Badge>
        {video.topic && <Badge variant="secondary">{video.topic}</Badge>}
      </div>

      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-border relative flex items-center justify-center">
        {/* Placeholder for actual video player */}
        {video.videoUrl ? (
           <iframe 
             src={video.videoUrl.replace('watch?v=', 'embed/')} 
             className="w-full h-full border-0" 
             allowFullScreen 
           />
        ) : (
          <div className="text-center text-white/70 flex flex-col items-center">
            <PlayCircle className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-xl">Video Player Placeholder</p>
            <p className="text-sm mt-2">In production, this would be an actual video or iframe embed.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {video.instructor?.charAt(0) || 'S'}
                </div>
                <span className="font-medium text-foreground">{video.instructor || 'Smart Coach Expert'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(video.duration / 60)} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{video.views} views</span>
              </div>
              {video.progress !== undefined && video.progress !== null && video.progress >= 95 && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium ml-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {video.description || 'No description available for this video lesson. Watch the video to learn the concepts in detail. Make sure to take notes while watching.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Related Resources</h3>
          <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
            <h4 className="font-semibold mb-1">Practice Questions</h4>
            <p className="text-sm text-muted-foreground mb-3">Test your understanding of this topic.</p>
            <Button variant="outline" className="w-full">Start Practice</Button>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
            <h4 className="font-semibold mb-1">Study Notes</h4>
            <p className="text-sm text-muted-foreground mb-3">Download PDF notes for this chapter.</p>
            <Button variant="outline" className="w-full">Download Notes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
