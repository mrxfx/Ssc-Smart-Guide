import { useState } from "react";
import { Link } from "wouter";
import { useGetPYQYears } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight } from "lucide-react";

export default function PYQHub() {
  const { data: years, isLoading } = useGetPYQYears();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Previous Year Questions</h1>
        <p className="text-muted-foreground">Practice real exam questions from previous years to understand the pattern.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {years?.map((yearData) => (
            <Card key={yearData.year} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  {yearData.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{yearData.count} Questions Available</p>
                <Link href={`/questions?year=${yearData.year}&isPYQ=true`}>
                  <Button className="w-full gap-2" variant="outline">
                    Practice Now <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          {(!years || years.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No previous year questions available right now.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
