import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { useToast } from "./ui/use-toast"
import { Plus, Edit, Archive, ArchiveRestore, Trash2, Save, X } from "lucide-react"

interface ManageEmployeesModalProps {
  userEmail: string
  isAdmin: boolean
}

export function ManageEmployeesModal({ userEmail, isAdmin }: ManageEmployeesModalProps) {
  const [open, setOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  
  const { toast } = useToast()
  
  // Queries
  const allEmployees = useQuery(api.employees.getAllEmployeesForAdmin, { user_email: userEmail })
  
  // Mutations
  const updateEmployee = useMutation(api.employees.updateEmployee)
  const addEmployee = useMutation(api.employees.addEmployee)
  const archiveEmployee = useMutation(api.employees.archiveEmployee)
  const unarchiveEmployee = useMutation(api.employees.unarchiveEmployee)
  const deleteEmployee = useMutation(api.employees.deleteEmployee)
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
    user_type: "employee" as "employee" | "lead" | "hr",
    manager_id: "" as string | ""
  })
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    user_type: "employee" as "employee" | "lead" | "hr",
    manager_id: "" as string | ""
  })
  
  // Filter employees
  const filteredEmployees = allEmployees?.filter(emp => 
    showArchived ? emp.archived : !emp.archived
  ) || []
  
  const activeEmployees = allEmployees?.filter(emp => !emp.archived) || []
  
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    
    try {
      await addEmployee({
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        user_type: newEmployee.user_type,
        manager_id: newEmployee.manager_id && newEmployee.manager_id !== "none" ? newEmployee.manager_id as any : undefined,
      })
      
      setNewEmployee({ name: "", email: "", role: "", user_type: "employee", manager_id: "" })
      setShowAddForm(false)
      toast({ title: "Success", description: "Employee added successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add employee", variant: "destructive" })
    }
  }
  
  const handleEditEmployee = async (id: string) => {
    try {
      await updateEmployee({
        id: id as any,
        user_type: editForm.user_type,
        manager_id: editForm.manager_id && editForm.manager_id !== "none" ? editForm.manager_id as any : null,
        role: editForm.role,
      })
      
      setEditingId(null)
      setEditForm({ name: "", email: "", role: "", user_type: "employee", manager_id: "" })
      toast({ title: "Success", description: "Employee updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update employee", variant: "destructive" })
    }
  }
  
  const handleArchiveEmployee = async (id: string) => {
    try {
      await archiveEmployee({ id: id as any })
      toast({ title: "Success", description: "Employee archived successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to archive employee", variant: "destructive" })
    }
  }
  
  const handleUnarchiveEmployee = async (id: string) => {
    try {
      await unarchiveEmployee({ id: id as any })
      toast({ title: "Success", description: "Employee unarchived successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to unarchive employee", variant: "destructive" })
    }
  }
  
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this employee?")) return
    
    try {
      await deleteEmployee({ id: id as any })
      toast({ title: "Success", description: "Employee deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete employee", variant: "destructive" })
    }
  }
  
  const startEditing = (employee: any) => {
    setEditingId(employee._id)
    setEditForm({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      user_type: employee.user_type,
      manager_id: employee.manager_id || "none",
    })
  }
  
  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({ name: "", email: "", role: "", user_type: "employee", manager_id: "" })
  }
  
  if (!isAdmin) return null
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Employees</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Employees & Roles</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={showArchived ? "outline" : "default"}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Show Active" : "Show Archived"}
              </Button>
              <Badge variant="outline">
                {filteredEmployees.length} {showArchived ? "archived" : "active"} employees
              </Badge>
            </div>
            
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Employee
            </Button>
          </div>
          
          {/* Add New Employee Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Add New Employee</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="new-name">Name *</Label>
                  <Input
                    id="new-name"
                    placeholder="Full Name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="email@company.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-role">Role *</Label>
                  <Input
                    id="new-role"
                    placeholder="Software Engineer"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-type">Type</Label>
                  <Select
                    value={newEmployee.user_type}
                    onValueChange={(val) => setNewEmployee({ ...newEmployee, user_type: val as "employee" | "lead" | "hr" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="hr">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-manager">Manager</Label>
                  <Select
                    value={newEmployee.manager_id}
                    onValueChange={(val) => setNewEmployee({ ...newEmployee, manager_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {activeEmployees
                        .filter(emp => emp.user_type === "lead")
                        .map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Employees Table */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      {editingId === employee._id ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {employee.name}
                          {employee.archived && (
                            <Badge variant="secondary" className="text-xs">Archived</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === employee._id ? (
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        employee.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === employee._id ? (
                        <Input
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        />
                      ) : (
                        employee.role
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === employee._id ? (
                        <Select
                          value={editForm.user_type}
                          onValueChange={(val) => setEditForm({ ...editForm, user_type: val as "employee" | "lead" | "hr" })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="hr">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">
                          {employee.user_type === "hr" ? "Admin" : employee.user_type === "lead" ? "Lead" : "Employee"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === employee._id ? (
                        <Select
                          value={editForm.manager_id}
                          onValueChange={(val) => setEditForm({ ...editForm, manager_id: val })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select Manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {activeEmployees
                              .filter(emp => emp.user_type === "lead" && emp._id !== employee._id)
                              .map((emp) => (
                                <SelectItem key={emp._id} value={emp._id}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {employee.manager_id ? 
                            activeEmployees.find(m => m._id === employee.manager_id)?.name || "Unknown" 
                            : "No Manager"
                          }
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.archived ? "secondary" : "default"}>
                        {employee.archived ? "Archived" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === employee._id ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee._id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEditing(employee)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {employee.archived ? (
                              <Button size="sm" variant="outline" onClick={() => handleUnarchiveEmployee(employee._id)}>
                                <ArchiveRestore className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleArchiveEmployee(employee._id)}>
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteEmployee(employee._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 