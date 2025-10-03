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

    // Filter out archived employees
    const activeEmployees = employees.filter(emp => !emp.archived)

    // If user is HR, return all active employees
    if (currentUser?.user_type === "hr") {
      return activeEmployees
    }

    // If user is a lead, return only their direct reports
    if (currentUser?.user_type === "lead") {
      return activeEmployees.filter((emp) => emp.manager_id === currentUser._id)
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

    // Filter out archived employees
    const activeEmployees = employees.filter(emp => !emp.archived)

    // Filter employees based on access level
    let filteredEmployees = activeEmployees
    if (currentUser?.user_type === "lead") {
      filteredEmployees = activeEmployees.filter((emp) => emp.manager_id === currentUser._id)
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

export const updateEmployee = mutation({
  args: { 
    id: v.id("employees"), 
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    user_type: v.optional(v.union(v.literal("employee"), v.literal("lead"), v.literal("hr"))),
    manager_id: v.optional(v.union(v.id("employees"), v.null())),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("=== UPDATING EMPLOYEE ===")
    console.log("Employee ID:", args.id)
    console.log("Update data:", args)
    
    const updates: any = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.email !== undefined) updates.email = args.email
    if (args.user_type !== undefined) {
      updates.user_type = args.user_type
      console.log("Setting user_type to:", args.user_type)
    }
    if (args.manager_id !== undefined) updates.manager_id = args.manager_id
    if (args.role !== undefined) updates.role = args.role
    
    console.log("Final updates to apply:", updates)
    await ctx.db.patch(args.id, updates)
    
    // Перевіряємо результат
    const updatedEmployee = await ctx.db.get(args.id)
    console.log("Employee after update:", updatedEmployee)
    console.log("=== UPDATE COMPLETED ===")
  },
})

export const archiveEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archived: true })
  },
})

export const unarchiveEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { archived: false })
  },
})

export const getAllEmployeesForAdmin = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = employees.find(emp => emp.email === args.user_email)
    
    // Only HR can see all employees including archived
    if (currentUser?.user_type !== "hr") {
      return []
    }
    
    return employees
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
    console.log("=== ADDING NEW EMPLOYEE ===")
    console.log("Employee data:", args)
    console.log("User type being set:", args.user_type)
    
    const employeeData = {
      name: args.name,
      email: args.email,
      role: args.role,
      user_type: args.user_type,
      manager_id: args.manager_id || undefined,
      archived: false,
    }
    
    console.log("Final employee data to insert:", employeeData)
    const newEmployeeId = await ctx.db.insert("employees", employeeData)
    
    // Перевіряємо результат
    const newEmployee = await ctx.db.get(newEmployeeId)
    console.log("Employee after insertion:", newEmployee)
    console.log("=== EMPLOYEE ADDED SUCCESSFULLY ===")
    
    return newEmployeeId
  },
})

export const deleteEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const fixUserTypes = mutation({
  handler: async (ctx) => {
    const employees = await ctx.db.query("employees").collect()
    
    // Визначаємо, хто є Lead
    const leaderIds = new Set<string>()
    for (const emp of employees) {
      if (emp.manager_id) {
        // Знаходимо всіх, хто має підлеглих
        const hasReports = employees.some(e => e.manager_id === emp._id)
        if (hasReports) {
          leaderIds.add(emp._id)
        }
      }
    }
    
    console.log("Leader IDs:", Array.from(leaderIds))
    
    let updatedCount = 0
    for (const emp of employees) {
      let newUserType = emp.user_type
      
      // Логіка визначення user_type
      if (emp.email === "yuriy.mykhasyak@cieden.com" || emp.email === "kateryna.gorodova@cieden.com") {
        newUserType = "hr"
      } else if (leaderIds.has(emp._id)) {
        newUserType = "lead"
      } else if (emp.role?.includes("Manager") || emp.role?.includes("Director") || emp.role?.includes("Head")) {
        newUserType = "lead"
      } else if (emp.role?.includes("Product Manager")) {
        newUserType = "lead"
      } else {
        newUserType = "employee"
      }
      
      if (newUserType !== emp.user_type) {
        console.log(`Updating ${emp.name} (${emp.email}) from ${emp.user_type} to ${newUserType}`)
        await ctx.db.patch(emp._id, { user_type: newUserType })
        updatedCount++
      }
    }
    
    console.log(`Updated ${updatedCount} employees`)
    return `Updated ${updatedCount} employees`
  }
})

export const getAllLeadsAndHR = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = employees.find(emp => emp.email === args.user_email)
    
    // Перевіряємо права доступу
    if (!currentUser || (currentUser.user_type !== "hr" && currentUser.user_type !== "lead")) {
      return []
    }
    
    // Повертаємо всіх активних Lead та HR користувачів
    const leadsAndHR = employees.filter(emp => 
      !emp.archived && (emp.user_type === "lead" || emp.user_type === "hr")
    )
    
    console.log(`Found ${leadsAndHR.length} Lead/HR users for ${currentUser.name}`)
    return leadsAndHR
  },
})

export const getDistinctRoles = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = employees.find(emp => emp.email === args.user_email)
    
    // Перевіряємо права доступу
    if (!currentUser || (currentUser.user_type !== "hr" && currentUser.user_type !== "lead")) {
      return []
    }
    
    // Фільтруємо співробітників залежно від рівня доступу
    let filteredEmployees = employees.filter(emp => !emp.archived)
    if (currentUser.user_type === "lead") {
      filteredEmployees = filteredEmployees.filter((emp) => emp.manager_id === currentUser._id)
    }
    
    // Отримуємо унікальні ролі
    const distinctRoles = [...new Set(filteredEmployees.map(emp => emp.role))]
      .filter(role => role && role.trim() !== "") // Видаляємо пусті ролі
      .sort() // Сортуємо за алфавітом
    
    console.log(`Found ${distinctRoles.length} distinct roles for ${currentUser.name}:`, distinctRoles)
    return distinctRoles
  },
})




