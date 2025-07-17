"use client"

import { useState } from "react"
import { CalendarIcon, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee } from "@/lib/data"

interface EmployeeTableProps {
  employees: Employee[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)

  const getStatusColor = (status: string) => {
    if (status === "🟥 Red") return "bg-red-100 text-red-800 hover:bg-red-100/80"
    if (status === "🟨 Yellow") return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
    if (status === "🟩 Green") return "bg-green-100 text-green-800 hover:bg-green-100/80"
    return ""
  }

  const getWorkloadColor = (workload: string) => {
    if (workload === "Overloaded") return "bg-red-100 text-red-800"
    if (workload === "Balanced") return "bg-blue-100 text-blue-800"
    if (workload === "Low") return "bg-green-100 text-green-800"
    return ""
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Position</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden lg:table-cell">Leader</TableHead>
              <TableHead className="hidden lg:table-cell">1:1 Person</TableHead>
              <TableHead>1:1 Date</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Workload</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No employees match the current filters
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{employee.position}</TableCell>
                  <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.leader}</TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.oneOnOnePerson}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(employee.meetingDate), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(employee.meetingDate), "MMMM yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={getWorkloadColor(employee.workload)}>
                      {employee.workload}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => setSelectedEmployee(employee)}>
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                          <DropdownMenuItem>Reschedule 1:1</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-[600px]">
                        {selectedEmployee && (
                          <>
                            <DialogHeader>
                              <DialogTitle>Employee Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Name:</div>
                                <div className="col-span-3">{selectedEmployee.name}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Position:</div>
                                <div className="col-span-3">{selectedEmployee.position}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Department:</div>
                                <div className="col-span-3">{selectedEmployee.department}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Leader:</div>
                                <div className="col-span-3">{selectedEmployee.leader}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">1:1 Person:</div>
                                <div className="col-span-3">{selectedEmployee.oneOnOnePerson}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">1:1 Date:</div>
                                <div className="col-span-3">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editDate
                                          ? format(editDate, "PPP")
                                          : format(new Date(selectedEmployee.meetingDate), "PPP")}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={editDate || new Date(selectedEmployee.meetingDate)}
                                        onSelect={setEditDate}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Status:</div>
                                <div className="col-span-3">
                                  <Select defaultValue={selectedEmployee.status}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="🟥 Red">🟥 Red</SelectItem>
                                      <SelectItem value="🟨 Yellow">🟨 Yellow</SelectItem>
                                      <SelectItem value="🟩 Green">🟩 Green</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Workload:</div>
                                <div className="col-span-3">
                                  <Select defaultValue={selectedEmployee.workload}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Low">Low</SelectItem>
                                      <SelectItem value="Balanced">Balanced</SelectItem>
                                      <SelectItem value="Overloaded">Overloaded</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-start gap-4">
                                <div className="font-medium">Comments:</div>
                                <Textarea className="col-span-3" defaultValue={selectedEmployee.comment} rows={4} />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button>Save Changes</Button>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
