import { useState } from "react";
import { useGetGlobalLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Leaderboard() {
  const [period, setPeriod] = useState<string>("weekly");

  // In a real app, pass period to the hook
  const { data: leaderboard, isLoading } = useGetGlobalLeaderboard();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">See how you rank among thousands of SSC GD aspirants.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Today</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="alltime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-2 border-muted shadow-md">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-20 text-center font-bold">Rank</TableHead>
                <TableHead>Aspirant</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.map((entry, idx) => (
                <TableRow key={entry.userId} className={entry.isCurrentUser ? "bg-primary/5 hover:bg-primary/10" : ""}>
                  <TableCell className="text-center font-bold">
                    {entry.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> :
                     entry.rank === 2 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                     entry.rank === 3 ? <Medal className="w-6 h-6 text-amber-700 mx-auto" /> :
                     <span className="text-muted-foreground">#{entry.rank}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={entry.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{entry.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{entry.name} {entry.isCurrentUser && "(You)"}</p>
                        {entry.isCurrentUser && <p className="text-xs text-primary font-medium">Keep it up!</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {entry.score}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground font-medium">
                    {entry.accuracy}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
