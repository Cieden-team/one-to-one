"use client"

import { useState, useRef } from "react"
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Filter, Plus, Users, Calendar, AlertTriangle, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEmployees, useCurrentUser, useSeedData } from "@/lib/convex-service"
import { useUser, UserButton } from "@clerk/nextjs"
import type { EmployeeWithDetails } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useClerk } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

export default function Dashboard() {
  return (
    <>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <SignIn routing="hash" appearance={{ variables: { colorPrimary: '#2563eb' } }} />
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  )
}

function DashboardContent() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workloadFilter, setWorkloadFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { user } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""
  const employees = useEmployees(userEmail)
  const currentUser = useCurrentUser(userEmail)
  const seedData = useSeedData()
  const { toast } = useToast()
  const { signOut } = useClerk()

  // --- Admin manage employees modal ---
  const [manageOpen, setManageOpen] = useState(false)
  const [editRoles, setEditRoles] = useState<{[id: string]: string}>({})
  const updateRole = useMutation(api.employees.updateRole)
  const addEmployee = useMutation(api.employees.addEmployee)
  const deleteEmployee = useMutation(api.employees.deleteEmployee)
  const [newEmp, setNewEmp] = useState<{ name: string; email: string; role: string; user_type: "employee"|"lead"|"hr"; manager_id: string }>({ name: "", email: "", role: "", user_type: "employee", manager_id: "" })
  const [adding, setAdding] = useState(false)

  const handleRoleChange = (id: string, role: string) => {
    setEditRoles((prev) => ({ ...prev, [id]: role }))
  }
  const handleSaveRoles = async () => {
    for (const id in editRoles) {
      await updateRole({ id, user_type: editRoles[id] })
    }
    setManageOpen(false)
    setEditRoles({})
    toast({ title: "Roles updated!" })
  }

  const handleResetData = async () => {
    await seedData()
    toast({ title: "Data reset!", description: "Demo/mock data was restored." })
  }

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.email || !newEmp.role) return toast({ title: "Fill all fields!" })
    await addEmployee({
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      user_type: newEmp.user_type as "employee"|"lead"|"hr",
      manager_id: newEmp.manager_id && newEmp.manager_id !== "none" ? (newEmp.manager_id as any) : undefined,
    })
    setNewEmp({ name: "", email: "", role: "", user_type: "employee", manager_id: "" })
    setAdding(false)
    toast({ title: "Employee added!" })
  }

  const handleDeleteEmployee = async (id: string) => {
    await deleteEmployee({ id: id as any })
    toast({ title: "Employee deleted!" })
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Loading user data...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access control logic
  const isAdmin = userEmail === "kateryna.gorodova@cieden.com"
  const isLead = currentUser.user_type === "lead"
  const isEmployee = currentUser.user_type === "employee"

  if (isEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You do not have access to this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter employees
  let filteredEmployees = employees || []
  if (isLead) {
    filteredEmployees = filteredEmployees.filter((emp) => emp.manager_id === currentUser._id)
  }
  // Admin бачить всіх, lead — тільки своїх
  filteredEmployees = filteredEmployees.filter((employee) => {
    if (statusFilter !== "all" && employee.last_meeting?.status !== statusFilter) return false
    if (workloadFilter !== "all" && employee.last_meeting?.workload !== workloadFilter) return false
    if (searchQuery && !employee.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Green":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "Yellow":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "Red":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
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

  // Calculate stats
  const totalEmployees = employees?.length || 0
  const overdueCount = (employees || []).filter((emp) => {
    if (!emp.last_meeting) return true
    const lastMeetingDate = new Date(emp.last_meeting.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastMeetingDate < thirtyDaysAgo
  }).length
  const redStatusCount = (employees || []).filter((emp) => emp.last_meeting?.status === "Red").length

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">1:1 Meeting Tracker</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isAdmin && (
                <Dialog open={manageOpen} onOpenChange={setManageOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Manage Employees</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Manage Employees & Roles</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">User Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees?.map((emp) => (
                            <tr key={emp._id}>
                              <td className="p-2">{emp.name}</td>
                              <td className="p-2">{emp.email}</td>
                              <td className="p-2">{emp.role}</td>
                              <td className="p-2">
                                <Select value={editRoles[emp._id] ?? emp.user_type} onValueChange={val => handleRoleChange(emp._id, val as "employee"|"lead"|"hr")}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hr">Admin</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="employee">Employee</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mb-4 border-b pb-4">
                      <h4 className="font-semibold mb-2">Add New Employee</h4>
                      <div className="flex flex-wrap gap-2 items-end">
                        <Input placeholder="Name" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} className="w-32" />
                        <Input placeholder="Email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} className="w-44" />
                        <Input placeholder="Role" value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} className="w-32" />
                        <Select value={newEmp.user_type} onValueChange={val => setNewEmp({ ...newEmp, user_type: val as "employee"|"lead"|"hr" })}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr">Admin</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={newEmp.manager_id || "none"} onValueChange={val => setNewEmp({ ...newEmp, manager_id: val })}>
                          <SelectTrigger className="w-40"><SelectValue placeholder="Manager (optional)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Manager</SelectItem>
                            {employees?.map((emp) => (
                              <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleAddEmployee}>Add</Button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setManageOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveRoles}>Save Changes</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <div className="relative group">
                <UserButton afterSignOutUrl="/" />
              </div>
              <Button variant="outline" size="sm" onClick={handleResetData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Data
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Under your management</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Overdue 1:1s</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
                <p className="text-xs text-muted-foreground">No meeting in 30+ days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Red Status</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{redStatusCount}</div>
                <p className="text-xs text-muted-foreground">Employees needing attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters & Search
                    </CardTitle>
                    <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search</label>
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Green">Green</SelectItem>
                          <SelectItem value="Yellow">Yellow</SelectItem>
                          <SelectItem value="Red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Workload</label>
                      <Select value={workloadFilter} onValueChange={setWorkloadFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Workloads</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Balanced">Balanced</SelectItem>
                          <SelectItem value="Overloaded">Overloaded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter("all")
                          setWorkloadFilter("all")
                          setSearchQuery("")
                        }}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Employee Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Last 1:1</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Workload</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No employees match the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>{employee.manager_name}</TableCell>
                          <TableCell>
                            {employee.last_meeting ? (
                              <div className="text-sm">
                                {format(new Date(employee.last_meeting.date), "MMM d, yyyy")}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No meetings</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {employee.last_meeting ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className={getStatusColor(employee.last_meeting.status)}>
                                    {employee.last_meeting.status}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getStatusExplanation(employee.last_meeting.status)}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {employee.last_meeting ? (
                              <Badge variant="outline" className={getWorkloadColor(employee.last_meeting.workload)}>
                                {employee.last_meeting.workload}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/employee/${employee._id}`}>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                              <Link href={`/employee/${employee._id}/new-meeting`}>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 mr-1" />
                                  New 1:1
                                </Button>
                              </Link>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteEmployee(employee._id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
