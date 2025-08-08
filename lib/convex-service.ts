import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import type { EmployeeWithDetails, OneOnOneWithDetails } from "./types"

export const useEmployees = (userEmail?: string) => {
  return useQuery(api.employees.getWithLastMeeting, { user_email: userEmail })
}

export const useAllLeadsAndHR = (userEmail: string) => {
  return useQuery(api.employees.getAllLeadsAndHR, { user_email: userEmail })
}

export const useCurrentUser = (email: string) => {
  return useQuery(api.employees.getCurrentUser, { email })
}

export const useEmployee = (id: string) => {
  return useQuery(api.employees.get, { id })
}

export const useOneOnOnes = (employeeId: string, userEmail?: string) => {
  return useQuery(api.oneOnOnes.getByEmployee, { 
    employee_id: employeeId, 
    user_email: userEmail 
  })
}

export const useCreateOneOnOne = () => {
  return useMutation(api.oneOnOnes.create)
}

export const useUpdateActionItem = () => {
  return useMutation(api.oneOnOnes.updateActionItem)
}

// export const useSeedData = () => {
//   return useMutation(api.seedData.seedData)
// }

export const useFixUserTypes = () => {
  return useMutation(api.employees.fixUserTypes)
}

 