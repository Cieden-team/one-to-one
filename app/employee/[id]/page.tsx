"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEmployee, useOneOnOnes, useCurrentUser } from "@/lib/convex-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Plus, User } from "lucide-react"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CURRENT_USER_EMAIL = "yuriy.mykhasyak@cieden.com"

export default function EmployeeProfile({ params }: { params: { id: string } }) {
  const router = useRouter()
  const employee = useEmployee(params.id)
  const meetings = useOneOnOnes(params.id, CURRENT_USER_EMAIL)

  if (employee === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employee profile...</p>
        </div>
      </div>
    )
  }
  if (employee === null) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Green":
        return "bg-green-100 text-green-800"
      case "Yellow":
        return "bg-yellow-100 text-yellow-800"
      case "Red":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case "Low":
        return "bg-blue-100 text-blue-800"
      case "Balanced":
        return "bg-green-100 text-green-800"
      case "Overloaded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const getStatusExplanation = (status: string) => {
    switch (status) {
      case "Green":
        return "Everything's good"
      case "Yellow":
        return "Moderate concerns or early signs of issues"
      case "Red":
        return "Serious issues with performance, motivation, or health"
      default:
        return "No status recorded"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="flex h-16 items-center px-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">{employee.name}</h1>
            </div>
            <div className="ml-auto">
              <Link href={`/employee/${params.id}/new-meeting`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New 1:1 Meeting
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg font-medium">{employee.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-lg">{employee.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{employee.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total 1:1s</label>
                  <p className="text-lg font-medium">{meetings?.length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1:1 Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                1:1 Meeting History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!meetings || meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No 1:1 meetings yet</p>
                  <Link href={`/employee/${params.id}/new-meeting`}>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule First Meeting
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Card key={meeting._id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{format(new Date(meeting.date), "MMMM d, yyyy")}</p>
                              <p className="text-sm text-muted-foreground">with {meeting.person_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getStatusExplanation(meeting.status)}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Badge className={getWorkloadColor(meeting.workload)}>{meeting.workload}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <span className="font-medium">Topics Discussed:</span>
                          <span className="ml-2">{meeting.topics}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Action Items:</span>
                          {meeting.action_items.length === 0 ? (
                            <span className="ml-2 text-muted-foreground">No action items</span>
                          ) : (
                            <ul className="ml-4 list-disc">
                              {meeting.action_items.map((item) => (
                                <li key={item._id} className="flex items-center gap-2">
                                  <Checkbox checked={item.done} disabled className="pointer-events-none" />
                                  <span className={item.done ? "line-through" : ""}>{item.text}</span>
                                  {item.due_date && (
                                    <span className="text-xs text-muted-foreground">(Due: {format(new Date(item.due_date), "MMM d, yyyy")})</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
