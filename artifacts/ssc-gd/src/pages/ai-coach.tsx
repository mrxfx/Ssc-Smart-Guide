import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, Calendar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AICoach() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hello! I am your AI Coach. How can I help you with your SSC GD preparation today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setQuery("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "That's a great question! For SSC GD, the most important topics in Mathematics are Percentages, Ratios, and Time & Work. Make sure to practice PYQs for these. Would you like me to generate a specific study plan for this?" 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
          <BrainCircuit className="w-8 h-8" /> AI Coach
        </h1>
        <p className="text-muted-foreground mt-2">Your personal 24/7 mentor for doubt solving and study planning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col h-full border-primary/20 shadow-md">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Doubt Solver Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted rounded-tl-sm border border-border'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted rounded-tl-sm border border-border flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-300"></div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t bg-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input 
                placeholder="Ask any doubt regarding SSC GD..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!query.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Tools */}
        <div className="space-y-6 flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Study Planner
              </CardTitle>
              <CardDescription>Get a personalized schedule based on your weak areas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Generate Plan</Button>
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                Last plan generated: <span className="font-medium text-foreground">3 days ago</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Badge variant="outline" className="justify-start py-2 px-3 text-sm cursor-pointer hover:bg-muted font-normal" onClick={() => setQuery("Explain the syllabus for SSC GD Math section")}>
                📚 Math Syllabus breakdown
              </Badge>
              <Badge variant="outline" className="justify-start py-2 px-3 text-sm cursor-pointer hover:bg-muted font-normal" onClick={() => setQuery("How to improve time management in mock tests?")}>
                ⏱️ Improve time management
              </Badge>
              <Badge variant="outline" className="justify-start py-2 px-3 text-sm cursor-pointer hover:bg-muted font-normal" onClick={() => setQuery("What is the physical standard test criteria?")}>
                🏃 Physical test criteria
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
