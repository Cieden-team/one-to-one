import type { Employee, OneOnOne, ActionItem, EmployeeWithDetails, OneOnOneWithDetails } from "./types"
import { mockEmployees, mockOneOnOnes, mockActionItems, CURRENT_USER_ID } from "./mock-data"

class DataService {
  private employees: Employee[] = []
  private oneOnOnes: OneOnOne[] = []
  private actionItems: ActionItem[] = []

  constructor() {
    this.loadData()
  }

  private loadData() {
    // Load from localStorage or use mock data
    const savedEmployees = localStorage.getItem("employees")
    const savedOneOnOnes = localStorage.getItem("oneOnOnes")
    const savedActionItems = localStorage.getItem("actionItems")

    this.employees = savedEmployees ? JSON.parse(savedEmployees) : mockEmployees
    this.oneOnOnes = savedOneOnOnes ? JSON.parse(savedOneOnOnes) : mockOneOnOnes
    this.actionItems = savedActionItems ? JSON.parse(savedActionItems) : mockActionItems

    this.saveData()
  }

  private saveData() {
    localStorage.setItem("employees", JSON.stringify(this.employees))
    localStorage.setItem("oneOnOnes", JSON.stringify(this.oneOnOnes))
    localStorage.setItem("actionItems", JSON.stringify(this.actionItems))
  }

  getCurrentUser(): Employee | null {
    return this.employees.find((emp) => emp.id === CURRENT_USER_ID) || null
  }

  getEmployeesWithLastMeeting(): EmployeeWithDetails[] {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return []

    let filteredEmployees = this.employees

    // Filter based on user type
    if (currentUser.user_type === "lead") {
      filteredEmployees = this.employees.filter((emp) => emp.manager_id === currentUser.id)
    } else if (currentUser.user_type !== "hr") {
      return []
    }

    return filteredEmployees.map((employee) => {
      const lastMeeting = this.oneOnOnes
        .filter((meeting) => meeting.employee_id === employee.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      const manager = employee.manager_id ? this.employees.find((emp) => emp.id === employee.manager_id) : null

      let lastMeetingWithDetails = null
      if (lastMeeting) {
        const person = this.employees.find((emp) => emp.id === lastMeeting.person_id)
        const actionItems = this.actionItems.filter((item) => item.one_on_one_id === lastMeeting.id)

        lastMeetingWithDetails = {
          ...lastMeeting,
          person_name: person?.name || "Unknown",
          action_items: actionItems,
        }
      }

      return {
        ...employee,
        manager_name: manager?.name || "No Manager",
        last_meeting: lastMeetingWithDetails,
      }
    })
  }

  getEmployee(id: string): Employee | null {
    return this.employees.find((emp) => emp.id === id) || null
  }

  getOneOnOnesByEmployee(employeeId: string): OneOnOneWithDetails[] {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return []

    const employee = this.getEmployee(employeeId)
    if (!employee) return []

    // Check access permissions
    if (currentUser.user_type !== "hr" && currentUser.user_type !== "lead" && employee.manager_id !== currentUser.id) {
      return []
    }

    const meetings = this.oneOnOnes
      .filter((meeting) => meeting.employee_id === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return meetings.map((meeting) => {
      const person = this.employees.find((emp) => emp.id === meeting.person_id)
      const actionItems = this.actionItems.filter((item) => item.one_on_one_id === meeting.id)

      return {
        ...meeting,
        person_name: person?.name || "Unknown",
        action_items: actionItems,
      }
    })
  }

  createOneOnOne(data: {
    employee_id: string
    date: string
    person_id: string
    topics: string
    status: "Green" | "Yellow" | "Red"
    workload: "Low" | "Balanced" | "Overloaded"
    action_items: Array<{
      text: string
      due_date: string
      done: boolean
    }>
  }): string {
    const meetingId = `meeting-${Date.now()}`

    const newMeeting: OneOnOne = {
      id: meetingId,
      employee_id: data.employee_id,
      date: data.date,
      person_id: data.person_id,
      topics: data.topics,
      status: data.status,
      workload: data.workload,
    }

    this.oneOnOnes.push(newMeeting)

    // Add action items
    data.action_items.forEach((item, index) => {
      const actionItem: ActionItem = {
        id: `action-${Date.now()}-${index}`,
        one_on_one_id: meetingId,
        text: item.text,
        due_date: item.due_date,
        done: item.done,
      }
      this.actionItems.push(actionItem)
    })

    this.saveData()
    return meetingId
  }

  updateActionItem(id: string, done: boolean): void {
    const actionItem = this.actionItems.find((item) => item.id === id)
    if (actionItem) {
      actionItem.done = done
      this.saveData()
    }
  }

  getAvailablePeople(): Employee[] {
    return this.employees.filter((emp) => emp.user_type === "hr" || emp.user_type === "lead")
  }

  // Reset data to mock data
  resetData(): void {
    this.employees = [...mockEmployees]
    this.oneOnOnes = [...mockOneOnOnes]
    this.actionItems = [...mockActionItems]
    this.saveData()
  }
}

export const dataService = new DataService()
