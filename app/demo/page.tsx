"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Filter, Plus, Users, Calendar, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for demo
const mockEmployees = [
  {
    _id: "1",
    name: "Jamie Wilson",
    role: "Senior Designer",
    manager_name: "Alex Chen",
    last_meeting: {
      date: "2024-06-15",
      status: "Green",
      workload: "Balanced",
    },
  },
  {
    _id: "2",
    name: "Taylor Brown",
    role: "UI Designer",
    manager_name: "Alex Chen",
    last_meeting: {
      date: "2024-06-10",
      status: "Yellow",
      workload: "Overloaded",
    },
  },
  {
    _id: "3",
    name: "Casey Miller",
    role: "UX Designer",
    manager_name: "Alex Chen",
    last_meeting: {
      date: "2024-06-08",
      status: "Green",
      workload: "Balanced",
    },
  },
  {
    _id: "4",
    name: "Riley Cooper",
    role: "Product Manager",
    manager_name: "Morgan Davis",
    last_meeting: {
      date: "2024-05-28",
      status: "Red",
      workload: "Overloaded",
    },
  },
  {
    _id: "5",
    name: "Jordan Lee",
    role: "Product Designer",
    manager_name: "Morgan Davis",
    last_meeting: null,
  },
]

export default function DemoDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workloadFilter, setWorkloadFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const employees = mockEmployees

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
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
  const totalEmployees = employees.length
  const overdueCount = employees.filter((emp) => {
    if (!emp.last_meeting) return true
    const lastMeetingDate = new Date(emp.last_meeting.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastMeetingDate < thirtyDaysAgo
  }).length
  const redStatusCount = employees.filter((emp) => emp.last_meeting?.status === "Red").length

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">1:1 Meeting Tracker - Demo</h1>
            </div>
            <div className="ml-auto">
              <Link href="/">
                <Button variant="outline">Back to Main App</Button>
              </Link>
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
                              <Button variant="outline" size="sm" disabled>
                                View Profile
                              </Button>
                              <Button size="sm" disabled>
                                <Plus className="h-4 w-4 mr-1" />
                                New 1:1
                              </Button>
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

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Demo Mode</h3>
                <p className="text-muted-foreground mb-4">
                  This is a demo version with mock data. To use the full application with Convex backend:
                </p>
                <ol className="text-left text-sm space-y-2 max-w-md mx-auto">
                  <li>1. Set up your Convex environment variable</li>
                  <li>
                    2. Run <code className="bg-gray-100 px-1 rounded">npx convex dev</code>
                  </li>
                  <li>
                    3. Run <code className="bg-gray-100 px-1 rounded">npx convex run seed:seedData</code>
                  </li>
                  <li>4. Navigate to the main app</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
