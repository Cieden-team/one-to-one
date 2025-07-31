import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
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
  const filteredItems = actionItems.filter(item => 
    progressFilter === "all" || item.progress === progressFilter
  )
  
  const getProgressColor = (progress: string) => {
    switch (progress) {
      case "done":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "done":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      case "archived":
        return <Archive className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  const handleProgressChange = async (itemId: string, newProgress: string) => {
    try {
      await updateActionItem({
        id: itemId as any,
        progress: newProgress as "done" | "in_progress" | "overdue" | "archived"
      })
      toast({ title: "Progress updated successfully" })
    } catch (error) {
      toast({ title: "Failed to update progress", variant: "destructive" })
    }
  }
  
  const handleDoneChange = async (itemId: string, done: boolean) => {
    try {
      await updateActionItem({
        id: itemId as any,
        done
      })
      toast({ title: "Status updated successfully" })
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }
  
  const stats = {
    total: actionItems.length,
    done: actionItems.filter(item => item.progress === "done").length,
    inProgress: actionItems.filter(item => item.progress === "in_progress").length,
    overdue: actionItems.filter(item => item.progress === "overdue").length,
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
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Completed items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
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
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(checked) => handleDoneChange(item._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{item.text}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.employee_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.responsible_name}</span>
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
                        value={item.progress}
                        onValueChange={(value) => handleProgressChange(item._id, value)}
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
                        {format(new Date(item.created_at), "MMM dd")}
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