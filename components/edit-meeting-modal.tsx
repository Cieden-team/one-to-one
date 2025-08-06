"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ActionItem {
  _id?: string
  text: string
  due_date: string
  done: boolean
  responsible_id?: string
}

interface Meeting {
  _id: string
  date: string
  person_id: string
  person_name: string
  topics: string
  status: "Green" | "Yellow" | "Red"
  workload: "Low" | "Balanced" | "Overloaded"
  action_items: any[]
}

interface EditMeetingModalProps {
  meeting: Meeting
  employeeId: string
  allPeople: any[]
  onMeetingUpdated: () => void
}

export function EditMeetingModal({ meeting, employeeId, allPeople, onMeetingUpdated }: EditMeetingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: meeting.date,
    person_id: meeting.person_id,
    topics: meeting.topics,
    status: meeting.status,
    workload: meeting.workload,
    action_items: meeting.action_items.map(item => ({
      _id: item._id,
      text: item.text,
      due_date: item.due_date,
      done: item.done,
      responsible_id: item.responsible_id || employeeId
    }))
  })
  const { toast } = useToast()
  
  const updateOneOnOne = useMutation(api.oneOnOnes.updateOneOnOne)
  const deleteOneOnOne = useMutation(api.oneOnOnes.deleteOneOnOne)
  const createActionItem = useMutation(api.actionItems.createActionItem)
  const updateActionItem = useMutation(api.actionItems.updateActionItem)
  const deleteActionItem = useMutation(api.actionItems.deleteActionItem)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Оновлюємо основний мітинг
      await updateOneOnOne({
        id: meeting._id as any,
        date: formData.date,
        person_id: formData.person_id as any,
        topics: formData.topics,
        status: formData.status,
        workload: formData.workload
      })

      // Оновлюємо action items
      for (const item of formData.action_items) {
        if (item._id) {
          // Оновлюємо існуючий action item
          await updateActionItem({
            id: item._id as any,
            text: item.text,
            due_date: item.due_date,
            responsible_id: item.responsible_id || null
          })
        } else {
          // Створюємо новий action item
          await createActionItem({
            one_on_one_id: meeting._id as any,
            text: item.text,
            due_date: item.due_date,
            responsible_id: item.responsible_id || null,
            created_by: formData.person_id as any
          })
        }
      }

      toast({ title: "Meeting updated successfully" })
      setIsOpen(false)
      onMeetingUpdated()
    } catch (error) {
      console.error("Failed to update meeting:", error)
      toast({ title: "Failed to update meeting", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting?")) return
    
    setIsSubmitting(true)
    try {
      await deleteOneOnOne({ id: meeting._id as any })
      toast({ title: "Meeting deleted successfully" })
      setIsOpen(false)
      onMeetingUpdated()
    } catch (error) {
      console.error("Failed to delete meeting:", error)
      toast({ title: "Failed to delete meeting", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addActionItem = () => {
    setFormData(prev => ({
      ...prev,
      action_items: [...prev.action_items, { text: "", due_date: "", done: false, responsible_id: employeeId, _id: undefined }]
    }))
  }

  const removeActionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index)
    }))
  }

  const updateActionItemField = (index: number, field: keyof ActionItem, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const availablePeople = allPeople.filter((emp) => emp.user_type === "hr" || emp.user_type === "lead")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit 1:1 Meeting</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="date">Meeting Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="person">1:1 Conducted By</Label>
              <Select value={formData.person_id} onValueChange={(value) => setFormData(prev => ({ ...prev, person_id: value }))} required>
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
              value={formData.topics}
              onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "Green" | "Yellow" | "Red" }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Yellow">Yellow</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workload">Workload</Label>
              <Select value={formData.workload} onValueChange={(value) => setFormData(prev => ({ ...prev, workload: value as "Low" | "Balanced" | "Overloaded" }))} required>
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

            {formData.action_items.length === 0 ? (
              <p className="text-muted-foreground text-sm">No action items added yet</p>
            ) : (
              <div className="space-y-3">
                {formData.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={(checked) => updateActionItemField(index, "done", checked as boolean)}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Action item description"
                        value={item.text}
                        onChange={(e) => updateActionItemField(index, "text", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Due date</Label>
                          <Input
                            type="date"
                            value={item.due_date}
                            onChange={(e) => updateActionItemField(index, "due_date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Responsible</Label>
                          <Select
                            value={item.responsible_id}
                            onValueChange={(value) => updateActionItemField(index, "responsible_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select responsible" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={employeeId}>
                                Employee
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

          <div className="flex justify-between pt-6">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              Delete Meeting
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 