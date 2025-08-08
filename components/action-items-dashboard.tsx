import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { format } from "date-fns"
import { Calendar, Clock, User, CheckCircle, AlertCircle, Archive } from "lucide-react"
import { useToast } from "./ui/use-toast"

interface ActionItemsDashboardProps {
  userEmail: string
}

export function ActionItemsDashboard({ userEmail }: ActionItemsDashboardProps) {
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const { toast } = useToast()
  
  const actionItems = useQuery(api.actionItems.getActionItems, { user_email: userEmail })
  const allEmployees = useQuery(api.employees.list, { user_email: userEmail })
  const updateActionItem = useMutation(api.actionItems.updateActionItem)
  
  if (!actionItems) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading action items...</p>
        </div>
      </div>
    )
  }
  
  // Фільтруємо за progress
  const filteredItems = actionItems?.filter(item => 
    progressFilter === "all" || item.progress === progressFilter
  ) || []
  
  const getProgressColor = (progress: string) => {
    switch (progress) {
      case "done":
        return "bg-[#6AC36A]/10 text-[#6AC36A] border-[#6AC36A]/20 dark:bg-[#6AC36A]/20 dark:text-[#6AC36A] dark:border-[#6AC36A]/30"
      case "in_progress":
        return "bg-[#6B8194]/10 text-[#6B8194] border-[#6B8194]/20 dark:bg-[#6B8194]/20 dark:text-[#6B8194] dark:border-[#6B8194]/30"
      case "overdue":
        return "bg-[#F44436]/10 text-[#F44436] border-[#F44436]/20 dark:bg-[#F44436]/20 dark:text-[#F44436] dark:border-[#F44436]/30"
      case "archived":
        return "bg-[#A5A5A5]/10 text-[#A5A5A5] border-[#A5A5A5]/20 dark:bg-[#A5A5A5]/20 dark:text-[#A5A5A5] dark:border-[#A5A5A5]/30"
      default:
        return "bg-[#A5A5A5]/10 text-[#A5A5A5] border-[#A5A5A5]/20 dark:bg-[#A5A5A5]/20 dark:text-[#A5A5A5] dark:border-[#A5A5A5]/30"
    }
  }
  
  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-[#6AC36A]" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-[#6B8194]" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-[#F44436]" />
      case "archived":
        return <Archive className="h-4 w-4 text-[#A5A5A5]" />
      default:
        return <Clock className="h-4 w-4 text-[#6B8194]" />
    }
  }
  
  const handleProgressChange = async (itemId: string, newProgress: string) => {
    try {
      console.log("Updating progress for item:", itemId, "to:", newProgress)
      
      await updateActionItem({
        id: itemId as any,
        progress: newProgress as "done" | "in_progress" | "overdue" | "archived"
      })
      toast({ title: "Progress updated successfully" })
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({ title: "Failed to update progress", variant: "destructive" })
    }
  }
  

  

  
  const stats = {
    total: actionItems?.length || 0,
    done: actionItems?.filter(item => item.progress === "done").length || 0,
    inProgress: actionItems?.filter(item => item.progress === "in_progress").length || 0,
    overdue: actionItems?.filter(item => item.progress === "overdue").length || 0,
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All action items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#6AC36A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#6AC36A]">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Completed items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-[#6B8194]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#6B8194]">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#F44436]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F44436]">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by progress:</span>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">
              {filteredItems.length} items
            </Badge>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                                      <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                    <TableRow key={item._id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{item.text || "No description"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.employee_name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.responsible_name || "Unassigned"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {item.due_date ? format(new Date(item.due_date), "MMM dd, yyyy") : "No date"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.progress || "in_progress"}
                        onValueChange={(value) => {
                          if (item && item._id) {
                            handleProgressChange(item._id, value)
                          } else {
                            console.error("Cannot update progress for item without _id:", item)
                            toast({ title: "Error", description: "Cannot update progress", variant: "destructive" })
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.created_at ? format(new Date(item.created_at), "MMM dd") : "Unknown"}
                      </span>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No action items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 