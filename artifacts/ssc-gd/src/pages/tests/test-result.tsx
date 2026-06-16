import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, MinusCircle, Trophy, ArrowLeft, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data since we don't have a real submit hook integrated yet
const mockResult = {
  score: 124.5,
  maxMarks: 160,
  accuracy: 85,
  percentile: 94.2,
  rank: 1254,
  correct: 65,
  incorrect: 11,
  skipped: 4,
  subjectWise: [
    { subject: "Reasoning", correct: 18, total: 20 },
    { subject: "GK", correct: 12, total: 20 },
    { subject: "Maths", correct: 16, total: 20 },
    { subject: "English", correct: 19, total: 20 },
  ],
  answers: [
    { questionId: "1", isCorrect: true, selectedOption: "A", correctOption: "A", explanation: "The pattern is +2, +4, +6." },
    { questionId: "2", isCorrect: false, selectedOption: "B", correctOption: "C", explanation: "Option C is correct because of the BODMAS rule." }
  ]
};

export default function TestResult() {
  const { id } = useParams();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tests">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Test Result</h1>
        </div>
        <Button variant="outline" className="gap-2"><Share2 className="w-4 h-4" /> Share</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[250px]">
            <Trophy className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-5xl font-black text-primary mb-2">{mockResult.score}</h2>
            <p className="text-muted-foreground mb-4">out of {mockResult.maxMarks} marks</p>
            <div className="w-full flex justify-between px-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="font-bold text-lg">#{mockResult.rank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentile</p>
                <p className="font-bold text-lg">{mockResult.percentile}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{mockResult.correct}</span>
                <span className="text-sm text-green-600 dark:text-green-500">Correct</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-2xl font-bold text-red-700 dark:text-red-400">{mockResult.incorrect}</span>
                <span className="text-sm text-red-600 dark:text-red-500">Incorrect</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <MinusCircle className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{mockResult.skipped}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Skipped</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockResult.subjectWise}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="correct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Questions</TabsTrigger>
              <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
              <TabsTrigger value="skipped">Skipped</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {mockResult.answers.map((ans, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 ${ans.isCorrect ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/5' : 'border-l-red-500 bg-red-50/50 dark:bg-red-900/5'} border-y border-r border-border`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Question {i + 1}</span>
                    {ans.isCorrect ? <Badge variant="outline" className="text-green-600 border-green-200">Correct</Badge> : <Badge variant="outline" className="text-red-600 border-red-200">Incorrect</Badge>}
                  </div>
                  <p className="mb-4 text-sm">Sample question text would appear here...</p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="text-muted-foreground">Your Answer:</span> <span className="font-semibold">{ans.selectedOption}</span></div>
                    <div><span className="text-muted-foreground">Correct Answer:</span> <span className="font-semibold text-green-600">{ans.correctOption}</span></div>
                  </div>
                  <div className="p-3 bg-card rounded border border-border text-sm">
                    <span className="font-semibold text-primary block mb-1">Explanation:</span>
                    {ans.explanation}
                  </div>
                </div>
              ))}
            </TabsContent>
            {/* Other tabs would filter the mockResult.answers */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Badge component since it might not be imported correctly if missing
function Badge({ children, variant, className }: any) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
