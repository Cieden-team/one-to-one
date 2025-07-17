"use client"

import { useState } from "react"
import { CalendarIcon, Download, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { EmployeeTable } from "./employee-table"
import { employees } from "@/lib/data"

export default function Dashboard() {
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("date-desc")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter employees based on selected filters
  const filteredEmployees = employees.filter((employee) => {
    // Filter by department
    if (filterDepartment && employee.department !== filterDepartment) {
      return false
    }

    // Filter by status
    if (filterStatus.length > 0 && !filterStatus.includes(employee.status)) {
      return false
    }

    // Filter by search query
    if (
      searchQuery &&
      !employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !employee.position.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
    } else if (sortBy === "date-asc") {
      return new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
    } else if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name)
    }
    return 0
  })

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold md:text-2xl">Talent Management Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming 1:1s</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => new Date(e.meetingDate) > new Date()).length}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled meetings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.filter((e) => e.workload === "Overloaded").length}</div>
              <p className="text-xs text-muted-foreground">Employees with high workload</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Status Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.filter((e) => e.status === "🟥 Red").length}</div>
              <p className="text-xs text-muted-foreground">Employees with red status</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">1:1 Meeting Tracker</h2>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full md:w-[200px] lg:w-[300px]"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px]" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Department</h4>
                      <Select
                        value={filterDepartment || ""}
                        onValueChange={(value) => setFilterDepartment(value || null)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Talent Management">Talent Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Status</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="status-red"
                            checked={filterStatus.includes("🟥 Red")}
                            onCheckedChange={() => handleStatusChange("🟥 Red")}
                          />
                          <Label htmlFor="status-red" className="flex items-center gap-1">
                            <span className="text-red-500">●</span> Red
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="status-yellow"
                            checked={filterStatus.includes("🟨 Yellow")}
                            onCheckedChange={() => handleStatusChange("🟨 Yellow")}
                          />
                          <Label htmlFor="status-yellow" className="flex items-center gap-1">
                            <span className="text-yellow-500">●</span> Yellow
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="status-green"
                            checked={filterStatus.includes("🟩 Green")}
                            onCheckedChange={() => handleStatusChange("🟩 Green")}
                          />
                          <Label htmlFor="status-green" className="flex items-center gap-1">
                            <span className="text-green-500">●</span> Green
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Meeting Date</h4>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterDepartment(null)
                        setFilterStatus([])
                        setDate(undefined)
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest first)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <EmployeeTable employees={sortedEmployees} />
        </div>
      </div>
    </div>
  )
}
