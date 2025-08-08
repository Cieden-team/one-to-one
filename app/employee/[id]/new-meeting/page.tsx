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
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useEmployee, useEmployees, useCurrentUser, useCreateOneOnOne } from "@/lib/convex-service"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

interface ActionItem {
  text: string
  due_date: string
  responsible_id: string
}

export default function NewMeeting({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""
  
  const employee = useEmployee(params.id)
  const allPeople = useEmployees(userEmail) // HR бачить всіх
  const currentUser = useCurrentUser(userEmail)
  const createOneOnOne = useCreateOneOnOne()

  // Автоматичне заповнення сьогоднішньої дати
  const today = new Date().toISOString().split('T')[0]
  
  const [date, setDate] = useState(today)
  const [personId, setPersonId] = useState<any>("")
  const [topics, setTopics] = useState("")
  const [status, setStatus] = useState<"Green" | "Yellow" | "Red" | "">("")
  const [workload, setWorkload] = useState<"Low" | "Balanced" | "Overloaded" | "">("")
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = (val: string) => setStatus(val as "Green" | "Yellow" | "Red")
  const handleWorkloadChange = (val: string) => setWorkload(val as "Low" | "Balanced" | "Overloaded")

  // Автозаповнення Conducted By поточним користувачем
  useEffect(() => {
    console.log("Current user data:", currentUser)
    if (currentUser && currentUser._id) {
      console.log("Setting personId to current user:", currentUser._id)
      setPersonId(currentUser._id)
    } else {
      console.log("Current user not available or missing _id")
    }
  }, [currentUser])

  // Додаткова перевірка, якщо personId не встановлений, але currentUser доступний
  useEffect(() => {
    if (!personId && currentUser && currentUser._id) {
      console.log("Setting personId from currentUser (fallback):", currentUser._id)
      setPersonId(currentUser._id)
    }
  }, [personId, currentUser])



  // Фільтруємо доступних людей (тільки HR та Lead) та сортуємо поточного користувача першим
  const availablePeople = (allPeople || [])
    .filter((emp) => emp.user_type === "hr" || emp.user_type === "lead")
    .sort((a, b) => {
      // Поточний користувач першим
      if (a._id === currentUser?._id) return -1
      if (b._id === currentUser?._id) return 1
      // Потім HR, потім Lead
      if (a.user_type === "hr" && b.user_type !== "hr") return -1
      if (b.user_type === "hr" && a.user_type !== "hr") return 1
      // Потім за іменем
      return a.name.localeCompare(b.name)
    })

  console.log("Available people:", availablePeople)
  console.log("Current personId:", personId)
  console.log("Current user:", currentUser)
  
  // Перевіряємо, чи поточний користувач має права на створення мітингів
  const canCreateMeetings = currentUser && (currentUser.user_type === "hr" || currentUser.user_type === "lead")

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

  if (employee === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Employee not found</p>
          <Link href="/">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Перевіряємо права доступу
  if (!canCreateMeetings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">You don't have permission to create 1:1 meetings</p>
          <p className="text-sm text-muted-foreground mt-2">Only HR and Lead users can create meetings.</p>
          <Link href="/">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const addActionItem = () => {
    setActionItems([...actionItems, { text: "", due_date: "", responsible_id: employee._id }])
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
    
    console.log("=== Starting form submission ===")
    console.log("Form data:", { date, personId, topics, status, workload, actionItems })
    
    // Валідація обов'язкових полів
    if (!employee || !personId) {
      console.error("Missing required fields: employee or personId")
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    
    if (!topics.trim()) {
      console.error("Topics is required")
      toast({ title: "Error", description: "Please enter topics discussed", variant: "destructive" })
      return
    }
    
    if (!status) {
      console.error("Status is required")
      toast({ title: "Error", description: "Please select a status", variant: "destructive" })
      return
    }
    
    if (!workload) {
      console.error("Workload is required")
      toast({ title: "Error", description: "Please select a workload", variant: "destructive" })
      return
    }
    
    // Валідація Action Items
    const validActionItems = actionItems.filter(item => 
      item.text.trim() !== "" && item.due_date && item.responsible_id
    )
    
    console.log("Action items validation:", {
      total: actionItems.length,
      valid: validActionItems.length,
      validItems: validActionItems
    })
    
    if (actionItems.length > 0 && validActionItems.length !== actionItems.length) {
      console.error("Some action items have missing required fields")
      toast({ title: "Error", description: "Please fill in all action item fields", variant: "destructive" })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const meetingData = {
        employee_id: employee._id as any,
        date,
        person_id: personId as any,
        topics,
        status: status as "Green" | "Yellow" | "Red",
        workload: workload as "Low" | "Balanced" | "Overloaded",
        action_items: validActionItems.map(item => ({
          text: item.text,
          due_date: item.due_date,
          done: false,
          responsible_id: item.responsible_id as any,
          created_by: currentUser?._id as any,
        })),
      }
      
      console.log("Creating meeting with data:", meetingData)
      
      const meeting = await createOneOnOne(meetingData)
      
      console.log("Meeting created successfully:", meeting)
      
      // Action items вже створені через createOneOnOne мутацію
      // Додаткове створення не потрібне
      console.log("Action items were created automatically with the meeting")
      
      console.log("=== Form submission completed successfully ===")
      toast({ title: "Success", description: "Meeting created successfully" })
      router.push(`/employee/${params.id}`)
    } catch (error) {
      console.error("Failed to create meeting:", error)
      console.error("Error details:", error)
      toast({ title: "Error", description: "Failed to create meeting", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <Link href={`/employee/${params.id}`}>
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[#683FFF]" />
              <h1 className="text-xl font-semibold">New 1:1 Meeting</h1>
              <span className="text-muted-foreground">with {employee.name}</span>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
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
                    <p className="text-xs text-muted-foreground mt-1">Today's date is pre-filled. You can change it if needed.</p>
                  </div>
                  <div>
                    <Label htmlFor="person">1:1 Conducted By</Label>
                    <Select value={personId} onValueChange={setPersonId} required>
                      <SelectTrigger>
                        <SelectValue placeholder={personId ? "Loading..." : "Select person"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePeople.map((person) => (
                          <SelectItem key={person._id} value={person._id}>
                            {person._id === currentUser?._id 
                              ? `${person.name} (You - ${person.user_type.toUpperCase()})`
                              : `${person.name} (${person.user_type.toUpperCase()})`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {personId 
                        ? "You are pre-selected. You can change to another HR or Lead if needed."
                        : "Loading current user..."
                      }
                    </p>
                    {personId && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Auto-filled with current user
                      </p>
                    )}
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
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Action item description"
                              value={item.text}
                              onChange={(e) => updateActionItem(index, "text", e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-muted-foreground">Due date</Label>
                                <Input
                                  type="date"
                                  value={item.due_date}
                                  onChange={(e) => updateActionItem(index, "due_date", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Responsible</Label>
                                <Select
                                  value={item.responsible_id}
                                  onValueChange={(val) => updateActionItem(index, "responsible_id", val)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select responsible" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={employee._id}>
                                      {employee.name} (Employee)
                                    </SelectItem>
                                    {availablePeople.map((person) => (
                                      <SelectItem key={person._id} value={person._id}>
                                        {person.name} ({person.user_type.toUpperCase()})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
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
