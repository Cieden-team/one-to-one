export interface Employee {
  id: string
  name: string
  role: string
  manager_id?: string
  email: string
  user_type: "employee" | "lead" | "hr"
}

export interface OneOnOne {
  id: string
  employee_id: string
  date: string
  person_id: string
  topics: string
  status: "Green" | "Yellow" | "Red"
  workload: "Low" | "Balanced" | "Overloaded"
}

export interface ActionItem {
  id: string
  one_on_one_id: string
  text: string
  done: boolean
  due_date: string
}

export interface EmployeeWithDetails extends Employee {
  manager_name?: string
  last_meeting?: OneOnOne & {
    person_name: string
    action_items: ActionItem[]
  }
}

export interface OneOnOneWithDetails extends OneOnOne {
  person_name: string
  action_items: ActionItem[]
}
