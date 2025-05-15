import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ListChecks, FileText } from "lucide-react"

export default function SummaryResult() {
  const cookieStore = cookies()
  const summaryCookie = cookieStore.get("video-summary")

  if (!summaryCookie?.value) {
    return null
  }

  let summary
  try {
    summary = JSON.parse(summaryCookie.value)
  } catch (error) {
    console.error("Error parsing summary cookie:", error)
    return null
  }

  if (!summary) {
    return null
  }

  return (
    <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-md overflow-hidden">
      <CardHeader className="bg-gray-800/80 border-b border-gray-700">
        <CardTitle className="text-xl">{summary.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {summary.duration}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full rounded-none border-b border-gray-700 bg-gray-800/50">
            <TabsTrigger value="summary" className="flex-1 data-[state=active]:bg-gray-700/50">
              <FileText className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="key-points" className="flex-1 data-[state=active]:bg-gray-700/50">
              <ListChecks className="h-4 w-4 mr-2" />
              Key Points
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="p-6 mt-0">
            <div className="prose prose-invert max-w-none">
              <p>{summary.summary}</p>
            </div>
          </TabsContent>
          <TabsContent value="key-points" className="p-6 mt-0">
            <ul className="space-y-2">
              {summary.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
