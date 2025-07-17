import type { Employee, OneOnOne, ActionItem } from "./types"

export const mockEmployees: Employee[] = [
  {
    id: "hr-1",
    name: "Sarah Johnson",
    role: "HR Manager",
    email: "sarah@agency.com",
    user_type: "hr",
  },
  {
    id: "lead-1",
    name: "Alex Chen",
    role: "Design Lead",
    email: "alex@agency.com",
    user_type: "lead",
  },
  {
    id: "lead-2",
    name: "Morgan Davis",
    role: "Product Lead",
    email: "morgan@agency.com",
    user_type: "lead",
  },
  {
    id: "emp-1",
    name: "Jamie Wilson",
    role: "Senior Designer",
    manager_id: "lead-1",
    email: "jamie@agency.com",
    user_type: "employee",
  },
  {
    id: "emp-2",
    name: "Taylor Brown",
    role: "UI Designer",
    manager_id: "lead-1",
    email: "taylor@agency.com",
    user_type: "employee",
  },
  {
    id: "emp-3",
    name: "Casey Miller",
    role: "UX Designer",
    manager_id: "lead-1",
    email: "casey@agency.com",
    user_type: "employee",
  },
  {
    id: "emp-4",
    name: "Riley Cooper",
    role: "Product Manager",
    manager_id: "lead-2",
    email: "riley@agency.com",
    user_type: "employee",
  },
  {
    id: "emp-5",
    name: "Jordan Lee",
    role: "Product Designer",
    manager_id: "lead-2",
    email: "jordan@agency.com",
    user_type: "employee",
  },
  {
    id: "emp-6",
    name: "Avery Thomas",
    role: "Motion Designer",
    manager_id: "lead-1",
    email: "avery@agency.com",
    user_type: "employee",
  },
]

export const mockOneOnOnes: OneOnOne[] = [
  {
    id: "meeting-1",
    employee_id: "emp-1",
    date: "2024-06-15",
    person_id: "lead-1",
    topics:
      "Discussed current project progress and upcoming deadlines. Reviewed design system updates and talked about career development goals.",
    status: "Green",
    workload: "Balanced",
  },
  {
    id: "meeting-2",
    employee_id: "emp-2",
    date: "2024-06-10",
    person_id: "lead-1",
    topics:
      "Addressed concerns about workload and project priorities. Discussed time management strategies and potential process improvements.",
    status: "Yellow",
    workload: "Overloaded",
  },
  {
    id: "meeting-3",
    employee_id: "emp-3",
    date: "2024-06-08",
    person_id: "hr-1",
    topics:
      "Regular check-in on team dynamics and personal development. Discussed training opportunities and feedback from recent projects.",
    status: "Green",
    workload: "Balanced",
  },
  {
    id: "meeting-4",
    employee_id: "emp-4",
    date: "2024-05-28",
    person_id: "lead-2",
    topics:
      "Performance review and goal setting. Discussed challenges with current project and need for additional resources.",
    status: "Red",
    workload: "Overloaded",
  },
  {
    id: "meeting-5",
    employee_id: "emp-1",
    date: "2024-05-15",
    person_id: "lead-1",
    topics:
      "Monthly check-in. Discussed completed projects and upcoming assignments. Very positive feedback from clients.",
    status: "Green",
    workload: "Balanced",
  },
  {
    id: "meeting-6",
    employee_id: "emp-6",
    date: "2024-05-20",
    person_id: "hr-1",
    topics: "Onboarding follow-up and initial feedback. Discussed adaptation to team culture and workflow.",
    status: "Yellow",
    workload: "Low",
  },
]

export const mockActionItems: ActionItem[] = [
  {
    id: "action-1",
    one_on_one_id: "meeting-1",
    text: "Complete design review by end of week",
    due_date: "2024-06-20",
    done: true,
  },
  {
    id: "action-2",
    one_on_one_id: "meeting-1",
    text: "Schedule follow-up meeting with stakeholders",
    due_date: "2024-06-25",
    done: false,
  },
  {
    id: "action-3",
    one_on_one_id: "meeting-2",
    text: "Prioritize current tasks and create timeline",
    due_date: "2024-06-15",
    done: true,
  },
  {
    id: "action-4",
    one_on_one_id: "meeting-2",
    text: "Discuss workload redistribution with team",
    due_date: "2024-06-18",
    done: false,
  },
  {
    id: "action-5",
    one_on_one_id: "meeting-3",
    text: "Enroll in UX research course",
    due_date: "2024-06-30",
    done: false,
  },
  {
    id: "action-6",
    one_on_one_id: "meeting-4",
    text: "Request additional team member for project",
    due_date: "2024-06-05",
    done: true,
  },
  {
    id: "action-7",
    one_on_one_id: "meeting-4",
    text: "Create project timeline with realistic deadlines",
    due_date: "2024-06-10",
    done: false,
  },
]

// Current user simulation - change this to test different user types
export const CURRENT_USER_ID = "lead-1" // Can be "hr-1", "lead-1", "lead-2", etc.
