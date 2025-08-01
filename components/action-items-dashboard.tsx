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
import { Calendar, Clock, User, CheckCircle, AlertCircle, Archive, Edit, Save, X } from "lucide-react"
import { useToast } from "./ui/use-toast"

interface ActionItemsDashboardProps {
  userEmail: string
}

export function ActionItemsDashboard({ userEmail }: ActionItemsDashboardProps) {
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    text: "",
    due_date: "",
    responsible_id: "",
    progress: "in_progress" as "done" | "in_progress" | "overdue" | "archived"
  })
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
  

  
  const startEditing = (item: any) => {
    try {
      console.log("Starting edit for item:", item)
      
      if (!item || !item._id) {
        console.error("Invalid item or missing _id:", item)
        toast({ title: "Error", description: "Invalid item data", variant: "destructive" })
        return
      }
      
      setEditingId(item._id)
      setEditForm({
        text: item.text || "",
        due_date: item.due_date || "",
        responsible_id: item.responsible_id || "",
        progress: item.progress || "in_progress"
      })
    } catch (error) {
      console.error("Error in startEditing:", error)
      toast({ title: "Error", description: "Failed to start editing", variant: "destructive" })
    }
  }
  
  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({
      text: "",
      due_date: "",
      responsible_id: "",
      progress: "in_progress"
    })
  }
  
  const saveEditing = async (itemId: string) => {
    try {
      await updateActionItem({
        id: itemId as any,
        text: editForm.text,
        due_date: editForm.due_date,
        responsible_id: editForm.responsible_id ? editForm.responsible_id as any : null,
        progress: editForm.progress
      })
      setEditingId(null)
      toast({ title: "Action item updated successfully" })
    } catch (error) {
      toast({ title: "Failed to update action item", variant: "destructive" })
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
                  <TableHead>Description</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                    <TableRow key={item._id}>
                    <TableCell className="max-w-xs">
                      {editingId === item._id ? (
                        <Input
                          value={editForm.text}
                          onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                        />
                      ) : (
                        <div className="truncate">{item.text || "No description"}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.employee_name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === item._id ? (
                        <Select
                          value={editForm.responsible_id}
                          onValueChange={(value) => setEditForm({ ...editForm, responsible_id: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select responsible" />
                          </SelectTrigger>
                                                  <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {allEmployees?.map((emp) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.name} ({emp.user_type?.toUpperCase() || "UNKNOWN"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{item.responsible_name || "Unassigned"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item._id ? (
                        <Input
                          type="date"
                          value={editForm.due_date}
                          onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {item.due_date ? format(new Date(item.due_date), "MMM dd, yyyy") : "No date"}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item._id ? (
                        <Select
                          value={editForm.progress}
                          onValueChange={(value) => setEditForm({ ...editForm, progress: value as any })}
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
                      ) : (
                        <Select
                          value={item.progress || "in_progress"}
                          onValueChange={(value) => item._id && handleProgressChange(item._id, value)}
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
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.created_at ? format(new Date(item.created_at), "MMM dd") : "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === item._id ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => item._id && saveEditing(item._id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEditing(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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