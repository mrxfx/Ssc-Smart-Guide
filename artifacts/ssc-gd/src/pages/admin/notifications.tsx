import { useState } from "react";
import { useListNotifications, useSendNotification } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Bell, BellRing } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNotifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const sendNotification = useSendNotification();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<any>("general");
  const [target, setTarget] = useState<any>("all");

  const handleSend = async () => {
    try {
      await sendNotification.mutateAsync({
        data: { title, message, type, target }
      });
      toast({ title: "Notification sent successfully" });
      setTitle("");
      setMessage("");
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to send notification", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground">Broadcast messages to users.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="premium">Premium Users Only</SelectItem>
                  <SelectItem value="free">Free Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Announcement</SelectItem>
                  <SelectItem value="exam">Exam Update</SelectItem>
                  <SelectItem value="reminder">Study Reminder</SelectItem>
                  <SelectItem value="result">New Results</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., New Mock Test Available!" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message here..." />
            </div>
            <Button onClick={handleSend} disabled={!title || !message || sendNotification.isPending} className="w-full">
              {sendNotification.isPending ? "Sending..." : "Send Broadcast"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold pt-1 lg:pt-0">Recent Broadcasts</h2>
        
        {isLoading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4 h-[70vh] overflow-y-auto pr-2">
            {notifications?.map((notif) => (
              <Card key={notif.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 ${
                      notif.type === 'exam' ? 'bg-red-100 text-red-600' : 
                      notif.type === 'reminder' ? 'bg-blue-100 text-blue-600' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {notif.type === 'exam' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!notifications || notifications.length === 0) && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card border-dashed">
                No recent notifications found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
