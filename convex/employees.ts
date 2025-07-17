import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    return employees.find(emp => emp.email === args.email) || null
  },
})

export const list = query({
  args: { user_email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()

    // Get the current user to determine access level
    const currentUser = args.user_email ? 
      employees.find(emp => emp.email === args.user_email) : null

    // If user is HR, return all employees
    if (currentUser?.user_type === "hr") {
      return employees
    }

    // If user is a lead, return only their direct reports
    if (currentUser?.user_type === "lead") {
      return employees.filter((emp) => emp.manager_id === currentUser._id)
    }

    // Regular employees can't see the list
    return []
  },
})

export const get = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getWithLastMeeting = query({
  args: { user_email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = args.user_email ? 
      employees.find(emp => emp.email === args.user_email) : null

    // Filter employees based on access level
    let filteredEmployees = employees
    if (currentUser?.user_type === "lead") {
      filteredEmployees = employees.filter((emp) => emp.manager_id === currentUser._id)
    } else if (currentUser?.user_type !== "hr") {
      return []
    }

    const employeesWithMeetings = await Promise.all(
      filteredEmployees.map(async (employee) => {
        const lastMeeting = await ctx.db
          .query("one_on_ones")
          .withIndex("by_employee", (q) => q.eq("employee_id", employee._id))
          .order("desc")
          .first()

        const manager = employee.manager_id ? await ctx.db.get(employee.manager_id) : null

        return {
          ...employee,
          manager_name: manager?.name || "No Manager",
          last_meeting: lastMeeting,
        }
      }),
    )

    return employeesWithMeetings
  },
})

export const updateRole = mutation({
  args: { id: v.id("employees"), user_type: v.union(v.literal("employee"), v.literal("lead"), v.literal("hr")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { user_type: args.user_type })
  },
})

export const addEmployee = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    user_type: v.union(v.literal("employee"), v.literal("lead"), v.literal("hr")),
    manager_id: v.optional(v.id("employees")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("employees", {
      name: args.name,
      email: args.email,
      role: args.role,
      user_type: args.user_type,
      manager_id: args.manager_id || undefined,
    })
  },
})

export const deleteEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
