"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useEmployee, useEmployees, useCurrentUser, useCreateOneOnOne } from "@/lib/convex-service"

interface ActionItem {
  text: string
  due_date: string
  done: boolean
}

const CURRENT_USER_EMAIL = "yuriy.mykhasyak@cieden.com" // TODO: замінити на реальний email з auth

export default function NewMeeting({ params }: { params: { id: string } }) {
  const router = useRouter()
  const employee = useEmployee(params.id)
  const allPeople = useEmployees(CURRENT_USER_EMAIL) // HR бачить всіх
  const currentUser = useCurrentUser(CURRENT_USER_EMAIL)
  const createOneOnOne = useCreateOneOnOne()
  const [checkedEmployee, setCheckedEmployee] = useState(false)

  const [date, setDate] = useState("")
  const [personId, setPersonId] = useState<any>("")
  const [topics, setTopics] = useState("")
  const [status, setStatus] = useState<"Green" | "Yellow" | "Red" | "">("")
  const [workload, setWorkload] = useState<"Low" | "Balanced" | "Overloaded" | "">("")
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = (val: string) => setStatus(val as "Green" | "Yellow" | "Red")
  const handleWorkloadChange = (val: string) => setWorkload(val as "Low" | "Balanced" | "Overloaded")

  // Автозаповнення Conducted By
  useEffect(() => {
    if (currentUser && currentUser._id) {
      setPersonId(currentUser._id)
    }
  }, [currentUser])

  useEffect(() => {
    if (employee !== undefined) setCheckedEmployee(true)
    if (employee === null && checkedEmployee) {
      router.replace("/")
    }
  }, [employee, checkedEmployee, router])

  if (employee === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const availablePeople = (allPeople || []).filter(
    (emp) => emp.user_type === "hr" || emp.user_type === "lead"
  )

  const addActionItem = () => {
    setActionItems([...actionItems, { text: "", due_date: "", done: false }])
  }

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index))
  }

  const updateActionItem = (index: number, field: keyof ActionItem, value: string | boolean) => {
    const updated = [...actionItems]
    updated[index] = { ...updated[index], [field]: value }
    setActionItems(updated)
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
        return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee || !personId) return
    setIsSubmitting(true)
    try {
      await createOneOnOne({
        employee_id: employee._id as any,
        date,
        person_id: personId as any,
        topics,
        status: status as "Green" | "Yellow" | "Red",
        workload: workload as "Low" | "Balanced" | "Overloaded",
        action_items: actionItems.filter((item) => item.text.trim() !== ""),
      })
      router.push(`/employee/${params.id}`)
    } catch (error) {
      // TODO: show error toast
      console.error("Failed to create meeting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="flex h-16 items-center px-6">
            <Link href={`/employee/${params.id}`}>
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">New 1:1 Meeting</h1>
              <span className="text-muted-foreground">with {employee.name}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Create 1:1 Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Meeting Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="person">1:1 Conducted By</Label>
                    <Select value={personId} onValueChange={setPersonId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePeople.map((person) => (
                          <SelectItem key={person._id} value={person._id}>
                            {person.name} ({person.user_type.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="topics">Topics Discussed</Label>
                  <Textarea
                    id="topics"
                    placeholder="What was discussed during the meeting?"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={handleStatusChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Green">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Green
                          </div>
                        </SelectItem>
                        <SelectItem value="Yellow">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Yellow
                          </div>
                        </SelectItem>
                        <SelectItem value="Red">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Red
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {status && <p className="text-xs text-muted-foreground mt-1">{getStatusExplanation(status)}</p>}
                  </div>
                  <div>
                    <Label htmlFor="workload">Workload</Label>
                    <Select value={workload} onValueChange={handleWorkloadChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workload" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Balanced">Balanced</SelectItem>
                        <SelectItem value="Overloaded">Overloaded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Action Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addActionItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action Item
                    </Button>
                  </div>

                  {actionItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No action items added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {actionItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={(checked) => updateActionItem(index, "done", checked as boolean)}
                          />
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Action item description"
                              value={item.text}
                              onChange={(e) => updateActionItem(index, "text", e.target.value)}
                            />
                            <Input
                              type="date"
                              value={item.due_date}
                              onChange={(e) => updateActionItem(index, "due_date", e.target.value)}
                            />
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeActionItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Link href={`/employee/${params.id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Meeting"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
